import { extractBraceBody } from "./scanner.js";

export interface NamespaceScope {
  namespace: string | null;
  body: string;
  start: number;
  end: number;
}

interface NamespaceDeclaration {
  namespace: string | null;
  kind: "braced" | "semicolon";
  start: number;
  bodyStart: number;
  bodyEnd?: number;
}

const NAMESPACE_RE = /^namespace(?:\s+([\w\\]+))?\s*(;|\{)/;

export function extractNamespaceScopes(source: string): NamespaceScope[] {
  const declarations: NamespaceDeclaration[] = [];
  let i = 0;
  let depth = 0;

  while (i < source.length) {
    if (depth === 0) {
      const match = NAMESPACE_RE.exec(source.slice(i));
      if (match && isWordBoundary(source, i, "namespace")) {
        const bodyStart = i + match[0].length;
        const namespace = match[1] ?? null;

        if (match[2] === "{") {
          const body = extractBraceBody(source, bodyStart);
          declarations.push({
            namespace,
            kind: "braced",
            start: i,
            bodyStart,
            bodyEnd: bodyStart + body.length,
          });
          i = bodyStart + body.length + 1;
          continue;
        }

        declarations.push({
          namespace,
          kind: "semicolon",
          start: i,
          bodyStart,
        });
        i = bodyStart;
        continue;
      }
    }

    if (source[i] === "{") depth++;
    else if (source[i] === "}") depth--;
    i++;
  }

  if (declarations.length === 0) {
    return [{ namespace: null, body: source, start: 0, end: source.length }];
  }

  return declarations.map((declaration, index) => {
    const end =
      declaration.kind === "braced"
        ? declaration.bodyEnd!
        : (declarations[index + 1]?.start ?? source.length);

    return {
      namespace: declaration.namespace,
      body: source.slice(declaration.bodyStart, end),
      start: declaration.bodyStart,
      end,
    };
  });
}

export function extractPrimaryNamespace(scopes: NamespaceScope[]): string | null {
  return scopes.find((scope) => scope.namespace !== null)?.namespace ?? null;
}

function isWordBoundary(source: string, index: number, word: string): boolean {
  const before = source[index - 1];
  const after = source[index + word.length];
  return !isWordChar(before) && !isWordChar(after);
}

function isWordChar(ch: string | undefined): boolean {
  return ch !== undefined && /[\w\\]/.test(ch);
}
