export interface SignatureTail {
  returnType: string | null;
  terminator: "{" | ";" | null;
  terminatorIndex: number;
}

export function extractBraceBody(source: string, startIdx: number): string {
  return extractDelimitedContent(source, startIdx, "{", "}");
}

export function extractParenContent(source: string, startIdx: number): string {
  return extractDelimitedContent(source, startIdx, "(", ")");
}

export function skipWhitespace(source: string, startIdx: number): number {
  let i = startIdx;
  while (i < source.length && /\s/.test(source[i]!)) {
    i++;
  }
  return i;
}

export function scanTopLevel(
  source: string,
  visitor: (index: number) => number | null | undefined,
): void {
  let parenDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;
  let i = 0;

  while (i < source.length) {
    if (parenDepth === 0 && bracketDepth === 0 && braceDepth === 0) {
      const next = visitor(i);
      if (typeof next === "number" && next > i) {
        i = next;
        continue;
      }
    }

    const ch = source[i]!;
    if (ch === "(") parenDepth++;
    else if (ch === ")" && parenDepth > 0) parenDepth--;
    else if (ch === "[") bracketDepth++;
    else if (ch === "]" && bracketDepth > 0) bracketDepth--;
    else if (ch === "{") braceDepth++;
    else if (ch === "}" && braceDepth > 0) braceDepth--;

    i++;
  }
}

export function readSignatureTail(source: string, startIdx: number): SignatureTail {
  let i = skipWhitespace(source, startIdx);

  if (source[i] !== ":") {
    const terminator = source[i] === "{" || source[i] === ";" ? (source[i] as "{" | ";") : null;
    return {
      returnType: null,
      terminator,
      terminatorIndex: i,
    };
  }

  i = skipWhitespace(source, i + 1);
  const { index, terminator } = findTopLevelTerminator(source, i, ["{", ";"]);
  const rawType = source.slice(i, index).trim();

  return {
    returnType: rawType ? rawType.replace(/\s+/g, "") : null,
    terminator: terminator as "{" | ";" | null,
    terminatorIndex: index,
  };
}

export function findTopLevelEquals(source: string): number {
  let depth = 0;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i]!;
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") depth--;
    else if (ch === "=" && depth === 0 && source[i + 1] !== "=") {
      return i;
    }
  }

  return -1;
}

function extractDelimitedContent(
  source: string,
  startIdx: number,
  openChar: string,
  closeChar: string,
): string {
  let depth = 1;
  let i = startIdx;

  while (i < source.length && depth > 0) {
    if (source[i] === openChar) depth++;
    else if (source[i] === closeChar) depth--;
    if (depth > 0) i++;
  }

  return source.slice(startIdx, i);
}

function findTopLevelTerminator(
  source: string,
  startIdx: number,
  terminators: string[],
): { index: number; terminator: string | null } {
  let parenDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;

  for (let i = startIdx; i < source.length; i++) {
    const ch = source[i]!;

    if (ch === "(") parenDepth++;
    else if (ch === ")" && parenDepth > 0) parenDepth--;
    else if (ch === "[") bracketDepth++;
    else if (ch === "]" && bracketDepth > 0) bracketDepth--;
    else if (ch === "{") {
      if (parenDepth === 0 && bracketDepth === 0 && braceDepth === 0 && terminators.includes(ch)) {
        return { index: i, terminator: ch };
      }
      braceDepth++;
    } else if (ch === "}" && braceDepth > 0) {
      braceDepth--;
    } else if (
      parenDepth === 0 &&
      bracketDepth === 0 &&
      braceDepth === 0 &&
      terminators.includes(ch)
    ) {
      return { index: i, terminator: ch };
    }
  }

  return { index: source.length, terminator: null };
}
