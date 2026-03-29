export function preprocess(source: string): string {
  let result = replaceStrings(source);
  result = stripComments(result);
  result = stripAttributes(result);
  return result;
}

function replaceStrings(source: string): string {
  let result = "";
  let i = 0;
  const len = source.length;

  while (i < len) {
    const ch = source[i]!;

    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      if (end !== -1) {
        result += source.slice(i, end + 2);
        i = end + 2;
        continue;
      }
    }

    if ((ch === "/" && source[i + 1] === "/") || (ch === "#" && source[i + 1] !== "[")) {
      const end = source.indexOf("\n", i);
      if (end !== -1) {
        result += source.slice(i, end);
        i = end;
      } else {
        result += source.slice(i);
        i = len;
      }
      continue;
    }

    if (ch === "<" && source[i + 1] === "<" && source[i + 2] === "<") {
      const afterArrows = i + 3;
      const heredocMatch = source.slice(afterArrows).match(/^(\s*)(')?([\w]+)\2\s*\n/);
      if (heredocMatch) {
        const label = heredocMatch[3]!;
        const fullMatchLen = heredocMatch[0].length;
        const startOfBody = afterArrows + fullMatchLen;
        const closingRe = new RegExp(`^\\s*${label}\\s*;?\\s*$`, "m");
        const bodySlice = source.slice(startOfBody);
        const closingMatch = closingRe.exec(bodySlice);
        if (closingMatch) {
          const endOfHeredoc = startOfBody + closingMatch.index! + closingMatch[0].length;
          result += `<<<${heredocMatch[0]}${"__PLACEHOLDER__"}
${label}\n`;
          i = endOfHeredoc;
          if (source[i] === "\n") i++;
          continue;
        }
      }
      result += ch;
      i++;
      continue;
    }

    if (ch === "'") {
      i++;
      while (i < len) {
        if (source[i] === "\\") {
          i += 2;
          continue;
        }
        if (source[i] === "'") {
          i++;
          break;
        }
        i++;
      }
      result += "'__PLACEHOLDER__'";
      continue;
    }

    if (ch === '"') {
      i++;
      while (i < len) {
        if (source[i] === "\\") {
          i += 2;
          continue;
        }
        if (source[i] === '"') {
          i++;
          break;
        }
        i++;
      }
      result += '"__PLACEHOLDER__"';
      continue;
    }

    if (ch === "`") {
      i++;
      while (i < len) {
        if (source[i] === "\\") {
          i += 2;
          continue;
        }
        if (source[i] === "`") {
          i++;
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

function stripComments(source: string): string {
  let result = "";
  let i = 0;
  const len = source.length;

  while (i < len) {
    if (source[i] === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      if (end !== -1) {
        const comment = source.slice(i, end + 2);
        result += comment.replace(/[^\n]/g, " ");
        i = end + 2;
        continue;
      }
    }

    if (source[i] === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i);
      i = end !== -1 ? end : len;
      continue;
    }

    if (source[i] === "#" && source[i + 1] !== "[") {
      const end = source.indexOf("\n", i);
      i = end !== -1 ? end : len;
      continue;
    }

    result += source[i];
    i++;
  }

  return result;
}

function stripAttributes(source: string): string {
  let result = "";
  let i = 0;
  const len = source.length;

  while (i < len) {
    if (source[i] === "#" && source[i + 1] === "[") {
      let depth = 0;
      i++;
      while (i < len) {
        if (source[i] === "[") depth++;
        else if (source[i] === "]") {
          depth--;
          if (depth === 0) {
            i++;
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
