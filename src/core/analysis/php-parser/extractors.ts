import type { PhpClassMeta, PhpFunctionMeta, PhpMethodMeta, PhpParamMeta } from "../../../types.js";
import {
  extractBraceBody,
  extractParenContent,
  readSignatureTail,
  scanTopLevel,
  findTopLevelEquals,
} from "./scanner.js";

const CLASS_LIKE_RE =
  /^((?:(?:abstract|final|readonly)\s+)*)(class|enum|interface|trait)\s+(\w+)([^{]*)\{/;
const FUNCTION_HEADER_RE = /^function\s+(\w+)\s*\(/;
const METHOD_HEADER_RE =
  /^((?:(?:public|protected|private|static|abstract|final)\s+)*)function\s+(\w+)\s*\(/;
const TRAIT_USE_RE = /^use\s+([\w\\]+(?:\s*,\s*[\w\\]+)*)\s*[;{]/;
const ENUM_CASE_RE = /^case\s+(\w+)\b/;

export function extractClasses(source: string, namespace: string | null): PhpClassMeta[] {
  const classes: PhpClassMeta[] = [];

  scanTopLevel(source, (index) => {
    const match = CLASS_LIKE_RE.exec(source.slice(index));
    if (!match) return null;

    const modifiers = match[1] || "";
    const keyword = match[2]! as "class" | "enum" | "interface" | "trait";
    const name = match[3]!;
    const afterName = match[4]!;
    const bodyStart = index + match[0].length;
    const body = extractBraceBody(source, bodyStart);
    const isEnum = keyword === "enum";
    const fqn = namespace ? `${namespace}\\${name}` : name;
    const constructor = extractConstructor(body);

    const { extendsClass, implementsList, enumBackingType } = parseClassRelationships(
      afterName,
      keyword,
    );

    classes.push({
      name,
      fqn,
      isAbstract: /\babstract\b/.test(modifiers),
      isFinal: /\bfinal\b/.test(modifiers),
      isReadonly: /\breadonly\b/.test(modifiers),
      isTrait: keyword === "trait",
      isInterface: keyword === "interface",
      extends: extendsClass,
      implements: implementsList,
      traits: keyword === "interface" ? [] : extractTraits(body),
      hasConstructor: constructor.hasConstructor,
      constructorParams: constructor.params,
      methods: extractMethods(body),
      isEnum,
      ...(isEnum ? { enumBackingType, enumCases: extractEnumCases(body) } : {}),
    });
    return bodyStart + body.length + 1;
  });

  return classes;
}

export function extractStandaloneFunctions(
  source: string,
  namespace: string | null,
): PhpFunctionMeta[] {
  const functions: PhpFunctionMeta[] = [];

  scanTopLevel(source, (index) => {
    const match = FUNCTION_HEADER_RE.exec(source.slice(index));
    if (!match) return null;

    const funcName = match[1]!;
    const parenStart = index + match[0].length - 1;
    const rawParams = extractParenContent(source, parenStart + 1);
    const afterParen = parenStart + rawParams.length + 2;
    const tail = readSignatureTail(source, afterParen);
    if (!tail.terminator) return null;

    functions.push({
      name: funcName,
      fqn: namespace ? `${namespace}\\${funcName}` : funcName,
      params: parseParams(rawParams),
      returnType: tail.returnType,
    });

    if (tail.terminator === "{") {
      const body = extractBraceBody(source, tail.terminatorIndex + 1);
      return tail.terminatorIndex + body.length + 2;
    }

    return tail.terminatorIndex + 1;
  });

  return functions;
}

function extractConstructor(classBody: string): {
  hasConstructor: boolean;
  params: PhpParamMeta[];
} {
  let hasConstructor = false;
  let params: PhpParamMeta[] = [];

  scanTopLevel(classBody, (index) => {
    const declaration = parseMethodDeclaration(classBody, index);
    if (!declaration) return null;

    if (declaration.name === "__construct") {
      hasConstructor = true;
      params = declaration.params;
    }

    return declaration.nextIndex;
  });

  return { hasConstructor, params };
}

function extractMethods(classBody: string): PhpMethodMeta[] {
  const methods: PhpMethodMeta[] = [];

  scanTopLevel(classBody, (index) => {
    const declaration = parseMethodDeclaration(classBody, index);
    if (!declaration) return null;
    if (declaration.name !== "__construct") {
      methods.push({
        name: declaration.name,
        isStatic: declaration.isStatic,
        visibility: declaration.visibility,
        params: declaration.params,
        returnType: declaration.returnType,
      });
    }

    return declaration.nextIndex;
  });

  return methods;
}

function splitParams(raw: string): string[] {
  const params: string[] = [];
  let depth = 0;
  let current = "";

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]!;
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
      current += ch;
    } else if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
      current += ch;
    } else if (ch === "," && depth === 0) {
      params.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  if (current.trim()) {
    params.push(current.trim());
  }

  return params;
}

function parseParams(raw: string): PhpParamMeta[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const params: PhpParamMeta[] = [];

  for (const [position, part] of splitParams(trimmed).entries()) {
    const param = parseOneParam(part.trim(), position);
    if (param) {
      params.push(param);
    }
  }

  return params;
}

function parseOneParam(raw: string, position: number): PhpParamMeta | null {
  let remaining = raw.trim();
  let visibility: "public" | "protected" | "private" | undefined;
  const visMatch = /^(public|protected|private)\s+/.exec(remaining);

  if (visMatch) {
    visibility = visMatch[1] as "public" | "protected" | "private";
    remaining = remaining.slice(visMatch[0].length);
  }

  const asymMatch = /^(private|protected)\(set\)\s+/.exec(remaining);
  if (asymMatch) {
    remaining = remaining.slice(asymMatch[0].length);
  }

  let isPromoted = !!visibility;
  const readonlyMatch = /^readonly\s+/.exec(remaining);
  if (readonlyMatch) {
    remaining = remaining.slice(readonlyMatch[0].length);
    if (!visibility) {
      isPromoted = true;
    }
  }

  let isVariadic = false;
  let defaultValue: string | undefined;
  const eqIdx = findTopLevelEquals(remaining);
  if (eqIdx !== -1) {
    defaultValue = remaining.slice(eqIdx + 1).trim();
    remaining = remaining.slice(0, eqIdx).trim();
  }

  if (remaining.includes("...")) {
    isVariadic = true;
    remaining = remaining.replace("...", "");
  }

  const dollarIdx = remaining.lastIndexOf("$");
  if (dollarIdx === -1) return null;

  let type: string | null = null;
  let nullable = false;
  const name = remaining.slice(dollarIdx + 1).trim();
  const beforeDollar = remaining.slice(0, dollarIdx).trim();

  if (beforeDollar) {
    type = beforeDollar;
    if (type.startsWith("?")) {
      nullable = true;
      type = type.slice(1);
    }
    if (type.includes("|")) {
      const unionParts = type.split("|").map((value) => value.trim().toLowerCase());
      if (unionParts.includes("null")) {
        nullable = true;
      }
    }
  }

  return {
    name,
    type,
    nullable,
    required: defaultValue === undefined && !isVariadic && !nullable,
    ...(defaultValue !== undefined ? { default: defaultValue } : {}),
    isVariadic,
    isPromoted,
    ...(visibility ? { visibility } : {}),
    position,
  };
}

function extractTraits(classBody: string): string[] {
  const traits: string[] = [];

  scanTopLevel(classBody, (index) => {
    const match = TRAIT_USE_RE.exec(classBody.slice(index));
    if (!match) return null;

    traits.push(
      ...match[1]!
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    );

    const terminator = match[0].trimEnd().at(-1);
    if (terminator === "{") {
      const braceIndex = index + match[0].lastIndexOf("{");
      const body = extractBraceBody(classBody, braceIndex + 1);
      return braceIndex + body.length + 2;
    }

    return index + match[0].length;
  });

  return traits;
}

function extractEnumCases(classBody: string): string[] {
  const enumCases: string[] = [];

  scanTopLevel(classBody, (index) => {
    const match = ENUM_CASE_RE.exec(classBody.slice(index));
    if (!match) return null;

    enumCases.push(match[1]!);
    const semicolonIndex = classBody.indexOf(";", index);
    return semicolonIndex === -1 ? classBody.length : semicolonIndex + 1;
  });

  return enumCases;
}

function parseMethodDeclaration(
  classBody: string,
  index: number,
): {
  name: string;
  isStatic: boolean;
  visibility: "public" | "protected" | "private";
  params: PhpParamMeta[];
  returnType: string | null;
  nextIndex: number;
} | null {
  const match = METHOD_HEADER_RE.exec(classBody.slice(index));
  if (!match) return null;

  const modifiers = match[1] || "";
  const name = match[2]!;
  const parenStart = index + match[0].length - 1;
  const rawParams = extractParenContent(classBody, parenStart + 1);
  const afterParen = parenStart + rawParams.length + 2;
  const tail = readSignatureTail(classBody, afterParen);

  let nextIndex = tail.terminatorIndex;
  if (tail.terminator === "{") {
    const body = extractBraceBody(classBody, tail.terminatorIndex + 1);
    nextIndex = tail.terminatorIndex + body.length + 2;
  } else if (tail.terminator === ";") {
    nextIndex = tail.terminatorIndex + 1;
  }

  return {
    name,
    isStatic: /\bstatic\b/.test(modifiers),
    visibility:
      (/\b(public|protected|private)\b/.exec(modifiers)?.[1] as
        | "public"
        | "protected"
        | "private"
        | undefined) ?? "public",
    params: parseParams(rawParams),
    returnType: tail.returnType,
    nextIndex,
  };
}

function parseClassRelationships(
  afterName: string,
  keyword: "class" | "enum" | "interface" | "trait",
): {
  extendsClass: string | null;
  implementsList: string[];
  enumBackingType: "string" | "int" | null;
} {
  let extendsClass: string | null = null;
  let enumBackingType: "string" | "int" | null = null;
  const implementsList: string[] = [];

  if (keyword === "enum") {
    const backingMatch = /:\s*(string|int)/.exec(afterName);
    if (backingMatch) {
      enumBackingType = backingMatch[1] as "string" | "int";
    }
  }

  const extendsMatch = /extends\s+([\w\\]+(?:\s*,\s*[\w\\]+)*)/.exec(afterName);
  if (extendsMatch) {
    extendsClass = extendsMatch[1]!.split(",")[0]!.trim();
  }

  const implementsMatch = /implements\s+([\w\\,\s]+)/.exec(afterName);
  if (implementsMatch) {
    implementsList.push(
      ...implementsMatch[1]!
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    );
  }

  return { extendsClass, implementsList, enumBackingType };
}
