export class TypegenArgsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TypegenArgsError";
  }
}

export function parseTypegenArgs(rawArgs: string[]): { dirs: string[]; optionsFile?: string } {
  const dirs: string[] = [];
  let optionsFile: string | undefined;

  for (let index = 0; index < rawArgs.length; index++) {
    const arg = rawArgs[index]!;

    if (arg === "--options-file") {
      const value = rawArgs[index + 1];
      if (!value || value.startsWith("-")) {
        throw new TypegenArgsError("Missing value for --options-file.");
      }
      optionsFile = value;
      index++;
      continue;
    }

    if (arg.startsWith("--options-file=")) {
      const value = arg.slice("--options-file=".length);
      if (!value) {
        throw new TypegenArgsError("Missing value for --options-file.");
      }
      optionsFile = value;
      continue;
    }

    dirs.push(arg);
  }

  return optionsFile === undefined ? { dirs } : { dirs, optionsFile };
}
