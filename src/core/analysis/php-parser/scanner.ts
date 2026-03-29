export function extractBraceBody(source: string, startIdx: number): string {
  let depth = 1;
  let i = startIdx;

  while (i < source.length && depth > 0) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") depth--;
    if (depth > 0) i++;
  }

  return source.slice(startIdx, i);
}

export function extractParenContent(source: string, startIdx: number): string {
  let depth = 1;
  let i = startIdx;

  while (i < source.length && depth > 0) {
    if (source[i] === "(") depth++;
    else if (source[i] === ")") depth--;
    if (depth > 0) i++;
  }

  return source.slice(startIdx, i);
}

export function extractTopLevelContent(body: string): string {
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

export function stripAnonymousClassBodies(body: string): string {
  const anonRe = /\bnew\s+class\b/g;
  let result = body;
  const matchPositions: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = anonRe.exec(body)) !== null) {
    matchPositions.push(match.index);
  }

  for (let i = matchPositions.length - 1; i >= 0; i--) {
    const start = matchPositions[i]!;
    const braceIdx = result.indexOf("{", start);
    if (braceIdx === -1) continue;

    const inner = extractBraceBody(result, braceIdx + 1);
    result = result.slice(0, braceIdx) + "{}" + result.slice(braceIdx + 1 + inner.length + 1);
  }

  return result;
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
