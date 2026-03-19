import { readFileSync } from "node:fs";
import type {
  PhpFileMeta,
  PhpClassMeta,
  PhpFunctionMeta,
  PhpMethodMeta,
  PhpParamMeta,
} from "./types.js";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function parsePhpFile(filePath: string): PhpFileMeta {
  const source = readFileSync(filePath, "utf-8");
  return parsePhpSource(source, filePath);
}

export function parsePhpSource(source: string, filePath: string): PhpFileMeta {
  const cleaned = preprocess(source);
  const ns = extractNamespace(cleaned);
  const classes = extractClasses(cleaned, ns);
  const functions = extractStandaloneFunctions(cleaned, ns);
  return { filePath, namespace: ns, classes, functions };
}

// ---------------------------------------------------------------------------
// Pre-processing: strip comments, replace strings, strip attributes
// ---------------------------------------------------------------------------

function preprocess(source: string): string {
  let result = replaceStrings(source);
  result = stripComments(result);
  result = stripAttributes(result);
  return result;
}

/**
 * Replace all string literals with placeholders so keywords inside strings
 * don't cause false matches. Handles single-quoted, double-quoted, heredoc,
 * and nowdoc strings.
 */
function replaceStrings(source: string): string {
  let result = "";
  let i = 0;
  const len = source.length;

  while (i < len) {
    const ch = source[i]!;

    // Skip multi-line comments (/* ... */) so that quotes inside comments
    // are not mistaken for string delimiters (e.g. "don't" in a doc block).
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      if (end !== -1) {
        result += source.slice(i, end + 2);
        i = end + 2;
        continue;
      }
    }

    // Skip single-line comments (// and # but not #[)
    if ((ch === "/" && source[i + 1] === "/") || (ch === "#" && source[i + 1] !== "[")) {
      const end = source.indexOf("\n", i);
      if (end !== -1) {
        result += source.slice(i, end);
        i = end; // keep the newline for next iteration
      } else {
        result += source.slice(i);
        i = len;
      }
      continue;
    }

    // Check for heredoc / nowdoc: <<<LABEL or <<<'LABEL'
    if (ch === "<" && source[i + 1] === "<" && source[i + 2] === "<") {
      const afterArrows = i + 3;
      // Match optional quote, identifier, optional quote, then newline
      const heredocMatch = source.slice(afterArrows).match(/^(\s*)(')?([\w]+)\2\s*\n/);
      if (heredocMatch) {
        const label = heredocMatch[3]!;
        const fullMatchLen = heredocMatch[0].length;
        const startOfBody = afterArrows + fullMatchLen;
        // Find the closing label at the start of a line (PHP 7.3+ allows indented)
        const closingRe = new RegExp(`^\\s*${label}\\s*;?\\s*$`, "m");
        const bodySlice = source.slice(startOfBody);
        const closingMatch = closingRe.exec(bodySlice);
        if (closingMatch) {
          const endOfHeredoc = startOfBody + closingMatch.index! + closingMatch[0].length;
          result += `<<<${heredocMatch[0]}${"__PLACEHOLDER__"}
${label}\n`;
          i = endOfHeredoc;
          // Skip optional newline after closing label
          if (source[i] === "\n") i++;
          continue;
        }
      }
      result += ch;
      i++;
      continue;
    }

    // Single-quoted string
    if (ch === "'") {
      i++; // skip opening quote
      while (i < len) {
        if (source[i] === "\\") {
          i += 2; // skip escaped char
          continue;
        }
        if (source[i] === "'") {
          i++; // skip closing quote
          break;
        }
        i++;
      }
      result += "'__PLACEHOLDER__'";
      continue;
    }

    // Double-quoted string
    if (ch === '"') {
      i++; // skip opening quote
      while (i < len) {
        if (source[i] === "\\") {
          i += 2; // skip escaped char
          continue;
        }
        if (source[i] === '"') {
          i++; // skip closing quote
          break;
        }
        i++;
      }
      result += '"__PLACEHOLDER__"';
      continue;
    }

    // Backtick string (shell exec)
    if (ch === "`") {
      i++; // skip opening backtick
      while (i < len) {
        if (source[i] === "\\") {
          i += 2; // skip escaped char
          continue;
        }
        if (source[i] === "`") {
          i++; // skip closing backtick
          break;
        }
        i++;
      }
      result += "`__PLACEHOLDER__`";
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

/**
 * Strip single-line comments (// and # but not #[) and multi-line comments.
 */
function stripComments(source: string): string {
  let result = "";
  let i = 0;
  const len = source.length;

  while (i < len) {
    // Multi-line comment /* ... */
    if (source[i] === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      if (end !== -1) {
        // Preserve newlines so line structure is maintained
        const comment = source.slice(i, end + 2);
        result += comment.replace(/[^\n]/g, " ");
        i = end + 2;
        continue;
      }
    }

    // Single-line comment //
    if (source[i] === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i);
      if (end !== -1) {
        i = end; // keep the newline
      } else {
        i = len;
      }
      continue;
    }

    // Single-line comment # (but not #[)
    if (source[i] === "#" && source[i + 1] !== "[") {
      const end = source.indexOf("\n", i);
      if (end !== -1) {
        i = end;
      } else {
        i = len;
      }
      continue;
    }

    result += source[i];
    i++;
  }

  return result;
}

/**
 * Strip PHP 8 attributes #[...] including nested brackets.
 */
function stripAttributes(source: string): string {
  let result = "";
  let i = 0;
  const len = source.length;

  while (i < len) {
    if (source[i] === "#" && source[i + 1] === "[") {
      // Skip the attribute
      let depth = 0;
      i++; // skip #
      while (i < len) {
        if (source[i] === "[") depth++;
        else if (source[i] === "]") {
          depth--;
          if (depth === 0) {
            i++; // skip closing ]
            break;
          }
        }
        i++;
      }
      continue;
    }
    result += source[i];
    i++;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Namespace extraction
// ---------------------------------------------------------------------------

function extractNamespace(source: string): string | null {
  const match = /namespace\s+([\w\\]+)\s*[;{]/.exec(source);
  return match ? match[1]! : null;
}

// ---------------------------------------------------------------------------
// Class / Enum / Trait / Interface extraction
// ---------------------------------------------------------------------------

/**
 * Pattern that matches class-like declarations. We capture:
 *   1: modifier prefix (any order of abstract/final/readonly)
 *   2: keyword (class|enum|interface|trait)
 *   3: name
 *   4: rest-of-line up to {
 */
const CLASS_LIKE_RE =
  /\b((?:(?:abstract|final|readonly)\s+)*)(class|enum|interface|trait)\s+(\w+)([^{]*)\{/g;

function extractClasses(source: string, ns: string | null): PhpClassMeta[] {
  const classes: PhpClassMeta[] = [];

  let match: RegExpExecArray | null;
  CLASS_LIKE_RE.lastIndex = 0;

  while ((match = CLASS_LIKE_RE.exec(source)) !== null) {
    const modifiers = match[1] || "";
    const isAbstract = /\babstract\b/.test(modifiers);
    const isFinal = /\bfinal\b/.test(modifiers);
    const isReadonly = /\breadonly\b/.test(modifiers);
    const keyword = match[2]!;
    const name = match[3]!;
    const afterName = match[4]!;

    // Skip anonymous classes: "new class { }" or "new class extends Foo { }"
    const before = source.slice(Math.max(0, match.index - 20), match.index);
    if (/\bnew\s*$/.test(before)) continue;

    const isEnum = keyword === "enum";
    const isTrait = keyword === "trait";
    const isInterface = keyword === "interface";

    // Extract the body using brace counting
    const bodyStart = match.index + match[0].length;
    const body = extractBraceBody(source, bodyStart);

    // Parse extends / implements / enum backing type
    let extendsClass: string | null = null;
    const implementsList: string[] = [];
    let enumBackingType: "string" | "int" | null = null;

    if (isEnum) {
      // Enum backing type: enum Name: string
      const backingMatch = /:\s*(string|int)/.exec(afterName);
      if (backingMatch) {
        enumBackingType = backingMatch[1] as "string" | "int";
      }
    }

    const extendsMatch = /extends\s+([\w\\]+(?:\s*,\s*[\w\\]+)*)/.exec(afterName);
    if (extendsMatch) {
      // For interfaces that extend multiple parents, take the first one
      // (downstream code expects a single string)
      extendsClass = extendsMatch[1]!.split(",")[0]!.trim();
    }

    const implementsMatch = /implements\s+([\w\\,\s]+)/.exec(afterName);
    if (implementsMatch) {
      implementsList.push(
        ...implementsMatch[1]!
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }

    // Extract enum cases (only at top-level, not inside methods)
    const enumCases: string[] = [];
    if (isEnum) {
      const topLevel = extractTopLevelContent(body);
      const caseRe = /\bcase\s+(\w+)/g;
      let caseMatch: RegExpExecArray | null;
      while ((caseMatch = caseRe.exec(topLevel)) !== null) {
        enumCases.push(caseMatch[1]!);
      }
    }

    // Extract trait usage: use TraitName; or use TraitA, TraitB;
    // Both classes and enums can use traits in PHP 8.1+
    const traits: string[] = [];
    if (keyword === "class" || keyword === "enum" || keyword === "trait") {
      const traitRe = /\buse\s+([\w\\]+(?:\s*,\s*[\w\\]+)*)\s*[;{]/g;
      let traitMatch: RegExpExecArray | null;
      while ((traitMatch = traitRe.exec(body)) !== null) {
        const traitNames = traitMatch[1]!
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        traits.push(...traitNames);
      }
    }

    // Extract constructor params
    const constructorParams = extractConstructorParams(body);

    // Extract methods
    const methods = extractMethods(body);

    const fqn = ns ? `${ns}\\${name}` : name;

    classes.push({
      name,
      fqn,
      isAbstract,
      isFinal,
      isReadonly,
      isTrait,
      isInterface,
      extends: extendsClass,
      implements: implementsList,
      traits,
      constructorParams,
      methods,
      isEnum,
      ...(isEnum ? { enumBackingType, enumCases } : {}),
    });
  }

  return classes;
}

// ---------------------------------------------------------------------------
// Standalone function extraction
// ---------------------------------------------------------------------------

function extractStandaloneFunctions(source: string, ns: string | null): PhpFunctionMeta[] {
  const functions: PhpFunctionMeta[] = [];

  // First, identify all class-like body ranges so we can exclude functions inside them
  const classRanges: Array<{ start: number; end: number }> = [];
  CLASS_LIKE_RE.lastIndex = 0;
  let clsMatch: RegExpExecArray | null;
  while ((clsMatch = CLASS_LIKE_RE.exec(source)) !== null) {
    const bodyStart = clsMatch.index + clsMatch[0].length;
    const body = extractBraceBody(source, bodyStart);
    classRanges.push({ start: clsMatch.index, end: bodyStart + body.length + 1 });
  }

  // Now find all function declarations (bracket-aware)
  const funcStartRe = /\bfunction\s+(\w+)\s*\(/g;

  let funcMatch: RegExpExecArray | null;
  while ((funcMatch = funcStartRe.exec(source)) !== null) {
    const funcPos = funcMatch.index;
    const funcName = funcMatch[1]!;

    // Skip if this is __construct or a method inside a class body
    if (funcName === "__construct") continue;

    // Check if this function is inside any class-like body
    const insideClass = classRanges.some((r) => funcPos > r.start && funcPos < r.end);
    if (insideClass) continue;

    // Bracket-aware param extraction
    const parenStart = funcPos + funcMatch[0].length - 1;
    const rawParams = extractParenContent(source, parenStart + 1);
    const afterCloseParen = parenStart + 1 + rawParams.length;

    // Check for optional return type and opening brace
    const afterSlice = source.slice(afterCloseParen + 1, afterCloseParen + 256);
    const retBraceMatch = /^\s*(?::\s*([\w\\|&?()\s]+?))?\s*\{/.exec(afterSlice);
    if (!retBraceMatch) continue;

    const returnType = retBraceMatch[1]?.replace(/\s+/g, "") ?? null;
    const params = parseParams(rawParams);
    const fqn = ns ? `${ns}\\${funcName}` : funcName;

    functions.push({ name: funcName, fqn, params, returnType });
  }

  return functions;
}

// ---------------------------------------------------------------------------
// Constructor extraction
// ---------------------------------------------------------------------------

function extractConstructorParams(classBody: string): PhpParamMeta[] {
  // Strip anonymous class bodies so their constructors don't leak
  const cleaned = stripAnonymousClassBodies(classBody);

  // Use regex with word boundary to avoid matching __constructHelper etc.
  const ctorMatch = /\bfunction\s+__construct\s*\(/.exec(cleaned);
  if (!ctorMatch) return [];

  // Find opening paren
  const parenOpen = cleaned.indexOf("(", ctorMatch.index);
  if (parenOpen === -1) return [];

  // Bracket-aware: find closing paren
  const rawParams = extractParenContent(cleaned, parenOpen + 1);
  return parseParams(rawParams);
}

// ---------------------------------------------------------------------------
// Method extraction
// ---------------------------------------------------------------------------

function extractMethods(classBody: string): PhpMethodMeta[] {
  const methods: PhpMethodMeta[] = [];

  // Strip anonymous class bodies so their methods don't leak into the parent
  const cleaned = stripAnonymousClassBodies(classBody);

  // Pattern: capture all modifiers (any order) before `function`
  const methodRe =
    /\b((?:(?:public|protected|private|static|abstract|final)\s+)*)function\s+(\w+)\s*\(/g;

  let match: RegExpExecArray | null;
  while ((match = methodRe.exec(cleaned)) !== null) {
    const modifiers = match[1] || "";
    const visMatch = /\b(public|protected|private)\b/.exec(modifiers);
    const visibility = (visMatch?.[1] as "public" | "protected" | "private") ?? "public";
    const isStatic = /\bstatic\b/.test(modifiers);
    const name = match[2]!;

    // Skip __construct from methods list (it's handled separately)
    if (name === "__construct") continue;

    // Extract params: find the full parameter list
    const parenStart = cleaned.indexOf("(", match.index + match[0].length - 1);
    const rawParams = extractParenContent(cleaned, parenStart + 1);
    const params = parseParams(rawParams);

    // Extract return type: look after the closing paren
    const afterParen = cleaned.indexOf(")", parenStart + 1 + rawParams.length);
    let returnType: string | null = null;
    if (afterParen !== -1) {
      const afterParenSlice = cleaned.slice(afterParen + 1, afterParen + 256);
      const retMatch = /^\s*:\s*([\w\\|&?()\s]+?)(?=\s*[{;])/.exec(afterParenSlice);
      if (retMatch) {
        returnType = retMatch[1]!.replace(/\s+/g, "");
      }
    }

    methods.push({ name, isStatic, visibility, params, returnType });
  }

  return methods;
}

// ---------------------------------------------------------------------------
// Parameter parsing
// ---------------------------------------------------------------------------

/**
 * Split a parameter string on commas at depth=0, tracking (), [], {} nesting.
 */
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

/**
 * Parse a raw parameter list string into PhpParamMeta[].
 */
function parseParams(raw: string): PhpParamMeta[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const parts = splitParams(trimmed);
  const params: PhpParamMeta[] = [];

  for (let position = 0; position < parts.length; position++) {
    const part = parts[position]!.trim();
    if (!part) continue;

    const param = parseOneParam(part, position);
    if (param) {
      params.push(param);
    }
  }

  return params;
}

/**
 * Parse a single parameter declaration.
 *
 * Possible forms:
 *   (public|protected|private)? (readonly)? Type $name (= default)?
 *   ...Type $name
 *   $name = default
 */
function parseOneParam(raw: string, position: number): PhpParamMeta | null {
  let remaining = raw.trim();

  // Extract visibility
  let visibility: "public" | "protected" | "private" | undefined;
  const visMatch = /^(public|protected|private)\s+/.exec(remaining);
  if (visMatch) {
    visibility = visMatch[1] as "public" | "protected" | "private";
    remaining = remaining.slice(visMatch[0].length);
  }

  // Skip PHP 8.4 asymmetric visibility: private(set) / protected(set)
  const asymMatch = /^(private|protected)\(set\)\s+/.exec(remaining);
  if (asymMatch) {
    remaining = remaining.slice(asymMatch[0].length);
  }

  // Extract readonly
  let isPromoted = !!visibility;
  const readonlyMatch = /^readonly\s+/.exec(remaining);
  if (readonlyMatch) {
    remaining = remaining.slice(readonlyMatch[0].length);
    // readonly without explicit visibility is still promoted
    if (!visibility) {
      isPromoted = true;
    }
  }

  // Check for variadic
  let isVariadic = false;

  // Extract default value (bracket-aware: split on = at depth 0)
  let defaultValue: string | undefined;
  const eqIdx = findTopLevelEquals(remaining);
  if (eqIdx !== -1) {
    defaultValue = remaining.slice(eqIdx + 1).trim();
    remaining = remaining.slice(0, eqIdx).trim();
  }

  // Now remaining is like: ?Type ...$name, or Type $name, or $name, or ...Type $name
  // Also handle union types: A|B $name, intersection: A&B $name, DNF: (A&B)|C $name

  // Check for variadic before the $name
  if (remaining.includes("...")) {
    isVariadic = true;
    remaining = remaining.replace("...", "");
  }

  // Split into type and name
  let type: string | null = null;
  let name: string;
  let nullable = false;

  // Find the parameter name ($variable)
  const dollarIdx = remaining.lastIndexOf("$");
  if (dollarIdx === -1) return null;

  name = remaining.slice(dollarIdx + 1).trim();
  const beforeDollar = remaining.slice(0, dollarIdx).trim();

  if (beforeDollar) {
    type = beforeDollar;
    // Handle nullable ?Type
    if (type.startsWith("?")) {
      nullable = true;
      type = type.slice(1);
    }
    // Union types containing null are also nullable
    if (type.includes("|")) {
      const unionParts = type.split("|").map((s) => s.trim());
      if (unionParts.some((p) => p.toLowerCase() === "null")) {
        nullable = true;
      }
    }
  }

  const required = defaultValue === undefined && !isVariadic && !nullable;

  return {
    name,
    type,
    nullable,
    required,
    ...(defaultValue !== undefined ? { default: defaultValue } : {}),
    isVariadic,
    isPromoted,
    ...(visibility ? { visibility } : {}),
    position,
  };
}

/**
 * Find the index of the first top-level = in a parameter string.
 * Skips = inside (), [], {}.
 */
function findTopLevelEquals(s: string): number {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!;
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") depth--;
    else if (ch === "=" && depth === 0) {
      // Make sure it's not == or ===
      if (s[i + 1] !== "=") return i;
    }
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Anonymous class body stripping
// ---------------------------------------------------------------------------

/**
 * Replace the bodies of anonymous classes (`new class { ... }`) with `{}`
 * so that methods/constructors inside anonymous classes don't leak into
 * the parent class's method/constructor lists.
 */
function stripAnonymousClassBodies(body: string): string {
  const anonRe = /\bnew\s+class\b/g;
  let result = body;
  const matchPositions: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = anonRe.exec(body)) !== null) {
    matchPositions.push(m.index);
  }
  // Process from end to start so indices remain valid
  for (let i = matchPositions.length - 1; i >= 0; i--) {
    const start = matchPositions[i]!;
    const braceIdx = result.indexOf("{", start);
    if (braceIdx === -1) continue;
    const inner = extractBraceBody(result, braceIdx + 1);
    result =
      result.slice(0, braceIdx) +
      "{}" +
      result.slice(braceIdx + 1 + inner.length + 1);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Top-level content extraction (skip nested braces)
// ---------------------------------------------------------------------------

/**
 * Return only the characters at brace depth 0 within a body string.
 * Used to avoid matching keywords (e.g. `case`) inside nested method bodies.
 */
function extractTopLevelContent(body: string): string {
  let result = "";
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]!;
    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
    } else if (depth === 0) {
      result += ch;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Brace / Paren body extraction
// ---------------------------------------------------------------------------

/**
 * Extract the content between braces, starting after the opening {.
 * `startIdx` is the index right after the opening {.
 * Returns the content between { and }.
 */
function extractBraceBody(source: string, startIdx: number): string {
  let depth = 1;
  let i = startIdx;

  while (i < source.length && depth > 0) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") depth--;
    if (depth > 0) i++;
  }

  return source.slice(startIdx, i);
}

/**
 * Extract content inside parentheses, starting after the opening (.
 * `startIdx` is the index right after the opening (.
 * Returns the content between ( and ).
 */
function extractParenContent(source: string, startIdx: number): string {
  let depth = 1;
  let i = startIdx;

  while (i < source.length && depth > 0) {
    if (source[i] === "(") depth++;
    else if (source[i] === ")") depth--;
    if (depth > 0) i++;
  }

  return source.slice(startIdx, i);
}
