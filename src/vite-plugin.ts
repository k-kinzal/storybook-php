import type { Plugin, ViteDevServer } from 'vite';
import { resolve, dirname, isAbsolute } from 'node:path';
import { parsePhpFile } from './php-parser.js';
import { createPhpMiddleware } from './dev-middleware.js';
import type { FrameworkOptions, PhpClassMeta, PhpMethodMeta, PhpParamMeta } from './types.js';

const PHP_RE = /\.php(?:@(\w+))?$/;
const VIRTUAL_PREFIX = '\0storybook-php:';

function paramsToArgMap(params: PhpParamMeta[]): string {
  if (params.length === 0) return '{}';

  const entries = params.map((p) => {
    const parts: string[] = [
      `type: '${p.type ?? 'unknown'}'`,
      `required: ${p.required}`,
      `position: ${p.position}`,
      `nullable: ${p.nullable}`,
    ];
    if (p.default !== undefined) {
      parts.push(`default: ${JSON.stringify(p.default)}`);
    }
    return `    ${p.name}: { ${parts.join(', ')} }`;
  });

  return `{\n${entries.join(',\n')}\n  }`;
}

function generateTemplateModule(filePath: string): string {
  return `export default {
  __php: true,
  __type: 'template',
  __file: ${JSON.stringify(filePath)},
  __class: null,
  __callable: null,
  __constructorArgs: {},
  __callableArgs: {},
  __allArgs: {},
};
`;
}

function generateClassMethodModule(
  filePath: string,
  cls: PhpClassMeta,
  method: PhpMethodMeta,
  callableName: string,
): string {
  const ctorArgs = paramsToArgMap(cls.constructorParams);
  const callableArgs = paramsToArgMap(method.params);

  return `export const ${cls.name} = {
  __php: true,
  __type: 'classMethod',
  __file: ${JSON.stringify(filePath)},
  __class: ${JSON.stringify(cls.fqn)},
  __callable: ${JSON.stringify(callableName)},
  __constructorArgs: ${ctorArgs},
  __callableArgs: ${callableArgs},
  __allArgs: { ...${ctorArgs}, ...${callableArgs} },
};
`;
}

function generateStaticMethodModule(
  filePath: string,
  cls: PhpClassMeta,
  method: PhpMethodMeta,
  callableName: string,
): string {
  const callableArgs = paramsToArgMap(method.params);

  return `export const ${cls.name} = {
  __php: true,
  __type: 'staticMethod',
  __file: ${JSON.stringify(filePath)},
  __class: ${JSON.stringify(cls.fqn)},
  __callable: ${JSON.stringify(callableName)},
  __constructorArgs: {},
  __callableArgs: ${callableArgs},
  __allArgs: ${callableArgs},
};
`;
}

function generateFunctionModule(
  filePath: string,
  fn: { name: string; fqn: string; params: PhpParamMeta[] },
  _callableName: string,
): string {
  const callableArgs = paramsToArgMap(fn.params);

  // Use FQN for the callable so PHP can resolve namespaced functions
  return `export const ${fn.name} = {
  __php: true,
  __type: 'function',
  __file: ${JSON.stringify(filePath)},
  __class: null,
  __callable: ${JSON.stringify(fn.fqn)},
  __constructorArgs: {},
  __callableArgs: ${callableArgs},
  __allArgs: ${callableArgs},
};
`;
}

function generateEnumMethodModule(
  filePath: string,
  cls: PhpClassMeta,
  _method: PhpMethodMeta,
  callableName: string,
): string {
  const caseArg = `{
    _case: { type: 'string', required: true, position: 0, nullable: false }
  }`;
  const methodArgs = paramsToArgMap(_method.params);

  return `export const ${cls.name} = {
  __php: true,
  __type: 'enumMethod',
  __file: ${JSON.stringify(filePath)},
  __class: ${JSON.stringify(cls.fqn)},
  __callable: ${JSON.stringify(callableName)},
  __constructorArgs: {},
  __callableArgs: ${methodArgs},
  __allArgs: { ...${caseArg}, ...${methodArgs} },
};
`;
}

export function storybookPhpPlugin(options: FrameworkOptions = {}): Plugin {
  return {
    name: 'storybook-php',
    enforce: 'pre',

    resolveId(source: string, importer: string | undefined) {
      const match = source.match(PHP_RE);
      if (!match) return null;

      const callable = match[1] ?? options.defaultMethod ?? null;
      const phpPath = source.replace(/@\w+$/, '');

      let absPath: string;
      if (isAbsolute(phpPath)) {
        absPath = phpPath;
      } else if (importer) {
        absPath = resolve(dirname(importer), phpPath);
      } else {
        return null;
      }

      return `${VIRTUAL_PREFIX}${absPath}?callable=${callable ?? ''}`;
    },

    load(id: string) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return null;

      const rest = id.slice(VIRTUAL_PREFIX.length);
      const qIdx = rest.indexOf('?');
      const filePath = qIdx === -1 ? rest : rest.slice(0, qIdx);
      const query = qIdx === -1 ? '' : rest.slice(qIdx + 1);
      const params = new URLSearchParams(query);
      const callableName = params.get('callable') || null;

      const meta = parsePhpFile(filePath!);

      // Template mode -- default export
      if (!callableName) {
        return generateTemplateModule(filePath!);
      }

      // Helper: find a method on a class, its traits, or its parents (within the same file)
      const findMethodInHierarchy = (
        cls: PhpClassMeta,
        methodName: string,
      ): { cls: PhpClassMeta; method: PhpMethodMeta } | null => {
        const method = cls.methods.find((m) => m.name === methodName);
        if (method) return { cls, method };

        // Traverse traits used by this class (within the same file)
        if (cls.traits && cls.traits.length > 0) {
          for (const traitName of cls.traits) {
            const trait = meta.classes.find(
              (c) => c.name === traitName || c.fqn === traitName,
            );
            if (trait) {
              const traitMethod = trait.methods.find((m) => m.name === methodName);
              if (traitMethod) {
                return { cls, method: traitMethod };
              }
            }
          }
        }

        // Traverse parent class if it's in the same file
        if (cls.extends) {
          const parent = meta.classes.find(
            (c) => c.name === cls.extends || c.fqn === cls.extends,
          );
          if (parent) {
            const found = findMethodInHierarchy(parent, methodName);
            if (found) {
              // Return the child class (for constructor) but the parent's method
              return { cls, method: found.method };
            }
          }
        }
        return null;
      };

      // Collect ALL matching exports (multiple classes may have the same method)
      const modules: string[] = [];

      // Search classes/enums for the callable
      for (const cls of meta.classes) {
        if (cls.isEnum) {
          const method = cls.methods.find((m) => m.name === callableName);
          if (method) {
            if (method.isStatic) {
              modules.push(generateStaticMethodModule(filePath!, cls, method, callableName));
            } else {
              modules.push(generateEnumMethodModule(filePath!, cls, method, callableName));
            }
          }
          continue;
        }

        // For abstract classes, only allow static methods (they can't be instantiated).
        // Instance methods are still resolved through concrete subclasses via findMethodInHierarchy.
        if (cls.isAbstract) {
          const method = cls.methods.find((m) => m.name === callableName && m.isStatic);
          if (method) {
            modules.push(generateStaticMethodModule(filePath!, cls, method, callableName));
          }
          continue;
        }

        const found = findMethodInHierarchy(cls, callableName);
        if (found) {
          if (found.method.isStatic) {
            // Only export a static method from the class that defines it directly.
            // Inherited static methods are already handled by the defining class's iteration.
            const definedDirectly = cls.methods.some((m) => m.name === callableName);
            if (definedDirectly) {
              modules.push(generateStaticMethodModule(filePath!, found.cls, found.method, callableName));
            }
          } else {
            modules.push(generateClassMethodModule(filePath!, found.cls, found.method, callableName));
          }
        }
      }

      if (modules.length > 0) {
        return modules.join('\n');
      }

      // Search standalone functions
      for (const fn of meta.functions) {
        if (fn.name === callableName) {
          return generateFunctionModule(filePath!, fn, callableName);
        }
      }

      // Not found
      return `throw new Error('PHP callable "${callableName}" not found in ${filePath}');`;
    },

    configureServer(server: ViteDevServer) {
      const middleware = createPhpMiddleware({
        phpBinary: options.phpBinary,
        timeout: options.timeout,
        bootstrap: options.bootstrap,
        adapter: options.adapter,
      });
      server.middlewares.use(middleware as any);
    },

    handleHotUpdate({ file, server }) {
      if (!file.endsWith('.php')) return;

      // Invalidate all virtual modules derived from this PHP file
      const mods = [...server.moduleGraph.idToModuleMap.values()].filter(
        (mod) => mod.id?.startsWith(VIRTUAL_PREFIX) && mod.id.includes(file),
      );

      if (mods.length > 0) {
        mods.forEach((mod) => server.moduleGraph.invalidateModule(mod));
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

export { VIRTUAL_PREFIX };
