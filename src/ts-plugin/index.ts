import type ts from "typescript";
import { readFileSync } from "node:fs";
import { createPhpResolver } from "./resolver.js";

interface PluginConfig {
  defaultMethod?: string;
}

function init(modules: { typescript: typeof ts }): ts.server.PluginModule {
  const tsModule = modules.typescript;

  function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    const config: PluginConfig = info.config ?? {};
    const resolver = createPhpResolver(tsModule, config.defaultMethod);
    const host = info.languageServiceHost;
    patchHost(host, resolver, tsModule);

    const proxy = Object.create(null) as ts.LanguageService;
    const ls = info.languageService;

    for (const key of Object.keys(ls) as Array<keyof ts.LanguageService>) {
      const value = ls[key];
      if (typeof value === "function") {
        (proxy as unknown as Record<string, unknown>)[key] = (...args: unknown[]) =>
          (value as (...innerArgs: unknown[]) => unknown).apply(ls, args);
      }
    }

    proxy.getSemanticDiagnostics = (fileName: string): ts.Diagnostic[] => {
      const diagnostics = ls.getSemanticDiagnostics(fileName);
      return diagnostics.filter((diagnostic) => {
        if (diagnostic.code === 2307 || diagnostic.code === 2792) {
          const text =
            typeof diagnostic.messageText === "string"
              ? diagnostic.messageText
              : diagnostic.messageText.messageText;
          if (/\.php(@\w+)?['"]/.test(text)) {
            return false;
          }
        }
        return true;
      });
    };

    return proxy;
  }

  function getExternalFiles(_project: ts.server.Project): string[] {
    return [];
  }

  return { create, getExternalFiles };
}

function patchHost(
  host: ts.LanguageServiceHost,
  resolver: ReturnType<typeof createPhpResolver>,
  tsModule: typeof ts,
): void {
  const originalFileExists = host.fileExists?.bind(host);
  const originalReadFile = host.readFile?.bind(host);
  const originalGetScriptSnapshot = host.getScriptSnapshot?.bind(host);
  const originalGetScriptVersion = host.getScriptVersion?.bind(host);

  host.fileExists = (fileName: string): boolean => {
    if (resolver.getVirtualDeclaration(fileName) !== null) {
      return true;
    }
    if (originalFileExists) {
      return originalFileExists(fileName);
    }
    try {
      readFileSync(fileName, "utf8");
      return true;
    } catch {
      return false;
    }
  };

  host.readFile = (fileName: string, encoding?: string): string | undefined => {
    const virtual = resolver.getVirtualDeclaration(fileName);
    if (virtual !== null) {
      return virtual;
    }
    return originalReadFile?.(fileName, encoding);
  };

  host.getScriptSnapshot = (fileName: string): ts.IScriptSnapshot | undefined => {
    const virtual = resolver.getVirtualDeclaration(fileName);
    if (virtual !== null) {
      return tsModule.ScriptSnapshot.fromString(virtual);
    }
    return originalGetScriptSnapshot?.(fileName);
  };

  host.getScriptVersion = (fileName: string): string => {
    const version = resolver.getVirtualDeclarationVersion(fileName);
    if (version !== null) {
      return version;
    }
    return originalGetScriptVersion?.(fileName) ?? "0";
  };
}

export default init;
