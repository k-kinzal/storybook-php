import type { PhpClassMeta, PhpFunctionMeta, PhpMethodMeta, PhpParamMeta } from "../../../types.js";
import {
  extractBraceBody,
  extractParenContent,
  extractTopLevelContent,
  findTopLevelEquals,
  stripAnonymousClassBodies,
} from "./scanner.js";

const CLASS_LIKE_RE =
  /\b((?:(?:abstract|final|readonly)\s+)*)(class|enum|interface|trait)\s+(\w+)([^{]*)\{/g;

export function extractClasses(source: string, namespace: string | null): PhpClassMeta[] {
  const classes: PhpClassMeta[] = [];
  let match: RegExpExecArray | null;

  CLASS_LIKE_RE.lastIndex = 0;
  while ((match = CLASS_LIKE_RE.exec(source)) !== null) {
    const modifiers = match[1] || "";
    const keyword = match[2]!;
    const name = match[3]!;
    const afterName = match[4]!;
    const before = source.slice(Math.max(0, match.index - 20), match.index);

    if (/\bnew\s*$/.test(before)) continue;

    const bodyStart = match.index + match[0].length;
    const body = extractBraceBody(source, bodyStart);
    const isEnum = keyword === "enum";
    const fqn = namespace ? `${namespace}\\${name}` : name;

    let extendsClass: string | null = null;
    const implementsList: string[] = [];
    let enumBackingType: "string" | "int" | null = null;

    if (isEnum) {
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

    const enumCases: string[] = [];
    if (isEnum) {
      const topLevel = extractTopLevelContent(body);
      const caseRe = /\bcase\s+(\w+)/g;
      let caseMatch: RegExpExecArray | null;
      while ((caseMatch = caseRe.exec(topLevel)) !== null) {
        enumCases.push(caseMatch[1]!);
      }
    }

    const traits: string[] = [];
    if (keyword === "class" || keyword === "enum" || keyword === "trait") {
      const traitRe = /\buse\s+([\w\\]+(?:\s*,\s*[\w\\]+)*)\s*[;{]/g;
      let traitMatch: RegExpExecArray | null;
      while ((traitMatch = traitRe.exec(body)) !== null) {
        traits.push(
          ...traitMatch[1]!
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        );
      }
    }

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
      traits,
      constructorParams: extractConstructorParams(body),
      methods: extractMethods(body),
      isEnum,
      ...(isEnum ? { enumBackingType, enumCases } : {}),
    });
  }

  return classes;
}

export function extractStandaloneFunctions(
  source: string,
  namespace: string | null,
): PhpFunctionMeta[] {
  const functions: PhpFunctionMeta[] = [];
  const classRanges: Array<{ start: number; end: number }> = [];
  let classMatch: RegExpExecArray | null;

  CLASS_LIKE_RE.lastIndex = 0;
  while ((classMatch = CLASS_LIKE_RE.exec(source)) !== null) {
    const bodyStart = classMatch.index + classMatch[0].length;
    const body = extractBraceBody(source, bodyStart);
    classRanges.push({ start: classMatch.index, end: bodyStart + body.length + 1 });
  }

  const funcStartRe = /\bfunction\s+(\w+)\s*\(/g;
  let funcMatch: RegExpExecArray | null;

  while ((funcMatch = funcStartRe.exec(source)) !== null) {
    const funcPos = funcMatch.index;
    const funcName = funcMatch[1]!;

    if (funcName === "__construct") continue;
    if (classRanges.some((range) => funcPos > range.start && funcPos < range.end)) continue;

    const parenStart = funcPos + funcMatch[0].length - 1;
    const rawParams = extractParenContent(source, parenStart + 1);
    const afterCloseParen = parenStart + 1 + rawParams.length;
    const afterSlice = source.slice(afterCloseParen + 1, afterCloseParen + 256);
    const retBraceMatch = /^\s*(?::\s*([\w\\|&?()\s]+?))?\s*\{/.exec(afterSlice);

    if (!retBraceMatch) continue;

    functions.push({
      name: funcName,
      fqn: namespace ? `${namespace}\\${funcName}` : funcName,
      params: parseParams(rawParams),
      returnType: retBraceMatch[1]?.replace(/\s+/g, "") ?? null,
    });
  }

  return functions;
}

function extractConstructorParams(classBody: string): PhpParamMeta[] {
  const cleaned = stripAnonymousClassBodies(classBody);
  const ctorMatch = /\bfunction\s+__construct\s*\(/.exec(cleaned);
  if (!ctorMatch) return [];

  const parenOpen = cleaned.indexOf("(", ctorMatch.index);
  if (parenOpen === -1) return [];

  return parseParams(extractParenContent(cleaned, parenOpen + 1));
}

function extractMethods(classBody: string): PhpMethodMeta[] {
  const methods: PhpMethodMeta[] = [];
  const cleaned = stripAnonymousClassBodies(classBody);
  const methodRe =
    /\b((?:(?:public|protected|private|static|abstract|final)\s+)*)function\s+(\w+)\s*\(/g;

  let match: RegExpExecArray | null;
  while ((match = methodRe.exec(cleaned)) !== null) {
    const modifiers = match[1] || "";
    const name = match[2]!;
    if (name === "__construct") continue;

    const parenStart = cleaned.indexOf("(", match.index + match[0].length - 1);
    const rawParams = extractParenContent(cleaned, parenStart + 1);
    const afterParen = cleaned.indexOf(")", parenStart + 1 + rawParams.length);
    let returnType: string | null = null;

    if (afterParen !== -1) {
      const afterParenSlice = cleaned.slice(afterParen + 1, afterParen + 256);
      const retMatch = /^\s*:\s*([\w\\|&?()\s]+?)(?=\s*[{;])/.exec(afterParenSlice);
      if (retMatch) {
        returnType = retMatch[1]!.replace(/\s+/g, "");
      }
    }

    methods.push({
      name,
      isStatic: /\bstatic\b/.test(modifiers),
      visibility:
        (/\b(public|protected|private)\b/.exec(modifiers)?.[1] as
          | "public"
          | "protected"
          | "private"
          | undefined) ?? "public",
      params: parseParams(rawParams),
      returnType,
    });
  }

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
