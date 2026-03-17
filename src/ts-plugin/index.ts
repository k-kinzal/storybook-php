import type ts from 'typescript';
import { createPhpResolver } from './resolver.js';

interface PluginConfig {
  /** storybook-php framework options */
  defaultMethod?: string;
}

function init(modules: { typescript: typeof ts }): ts.server.PluginModule {
  const _tsModule = modules.typescript;

  function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    const config: PluginConfig = info.config ?? {};
    createPhpResolver(_tsModule, config.defaultMethod);
    const proxy = Object.create(null) as ts.LanguageService;
    const ls = info.languageService;

    // Copy all methods from the original language service
    for (const k of Object.keys(ls) as Array<keyof ts.LanguageService>) {
      const x = ls[k];
      if (typeof x === 'function') {
        (proxy as unknown as Record<string, unknown>)[k] = (...args: unknown[]) =>
          (x as (...a: unknown[]) => unknown).apply(ls, args);
      }
    }

    // Override getSemanticDiagnostics to suppress "cannot find module" for .php imports
    proxy.getSemanticDiagnostics = (fileName: string): ts.Diagnostic[] => {
      const diagnostics = ls.getSemanticDiagnostics(fileName);
      return diagnostics.filter((d) => {
        if (d.code === 2307 || d.code === 2792) {
          // "Cannot find module" errors
          const text =
            typeof d.messageText === 'string'
              ? d.messageText
              : d.messageText.messageText;
          if (/\.php(@\w+)?['"]/.test(text)) {
            return false; // Suppress for .php imports
          }
        }
        return true;
      });
    };

    // Override getCompletionsAtPosition to add PHP arg completions
    proxy.getCompletionsAtPosition = (
      fileName: string,
      position: number,
      options: ts.GetCompletionsAtPositionOptions | undefined,
    ): ts.WithMetadata<ts.CompletionInfo> | undefined => {
      const result = ls.getCompletionsAtPosition(fileName, position, options);
      // Could add PHP-specific completions here in the future
      return result;
    };

    // Override getQuickInfoAtPosition for hover info on PHP imports
    proxy.getQuickInfoAtPosition = (
      fileName: string,
      position: number,
    ): ts.QuickInfo | undefined => {
      return ls.getQuickInfoAtPosition(fileName, position);
    };

    return proxy;
  }

  function getExternalFiles(_project: ts.server.Project): string[] {
    // Return .php files that should be watched
    return [];
  }

  return { create, getExternalFiles };
}

export default init;
