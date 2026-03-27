import type { Plugin, ViteDevServer } from "vite";
import { resolve, dirname, isAbsolute } from "node:path";
import { parsePhpFile } from "./php-parser.js";
import { createPhpMiddleware } from "./dev-middleware.js";
import type {
  FrameworkOptions,
  PhpClassMeta,
  PhpFileMeta,
  PhpMethodMeta,
  PhpParamMeta,
  ArgOverride,
  FileMapTarget,
  AdapterMap,
} from "./types.js";

const PHP_RE = /\.php(?:@(\w+))?$/;
const VIRTUAL_PREFIX = "\0storybook-php:";

interface EnrichedParamMeta extends PhpParamMeta {
  options?: (string | number | boolean)[];
  elementType?: string;
}

function paramsToArgMap(params: (PhpParamMeta | EnrichedParamMeta)[]): string {
  if (params.length === 0) return "{}";

  const entries = params.map((p) => {
    const typeEscaped = (p.type ?? "unknown").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    const parts: string[] = [
      `type: '${typeEscaped}'`,
      `required: ${p.required}`,
      `position: ${p.position}`,
      `nullable: ${p.nullable}`,
    ];
    if (p.default !== undefined) {
      parts.push(`default: ${JSON.stringify(p.default)}`);
    }
    const ep = p as EnrichedParamMeta;
    if (ep.options !== undefined) {
      parts.push(`options: ${JSON.stringify(ep.options)}`);
    }
    if (ep.elementType !== undefined) {
      parts.push(`elementType: ${JSON.stringify(ep.elementType)}`);
    }
    return `    ${p.name}: { ${parts.join(", ")} }`;
  });

  return `{\n${entries.join(",\n")}\n  }`;
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
  ctorParams?: PhpParamMeta[],
): string {
  const ctorArgs = paramsToArgMap(ctorParams ?? cls.constructorParams);
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

// ---------------------------------------------------------------------------
// TypeMap helpers
// ---------------------------------------------------------------------------

/**
 * Merge two FileMapTarget objects. `exact` fields take precedence over `pattern`.
 */
function mergeFileMapTargets(pattern: FileMapTarget, exact: FileMapTarget): FileMapTarget {
  const result: FileMapTarget = {};
  if (exact.args ?? pattern.args) result.args = exact.args ?? pattern.args;
  if (exact.phpFile ?? pattern.phpFile) result.phpFile = exact.phpFile ?? pattern.phpFile;
  if (exact.callable ?? pattern.callable) result.callable = exact.callable ?? pattern.callable;
  if (exact.includes ?? pattern.includes) result.includes = exact.includes ?? pattern.includes;
  if (exact.adapter ?? pattern.adapter) result.adapter = exact.adapter ?? pattern.adapter;
  return result;
}

/**
 * Resolve a typeMap.files key against a config base directory.
 * Supports both exact path matches and glob patterns (keys starting with "*").
 * When both an exact match and a pattern match exist, their fields are merged
 * with exact-match fields taking precedence.
 *
 * When multiple glob patterns match, the most specific one wins (longest suffix).
 */
function findFileMapping(
  absPath: string,
  fileMap: Record<string, FileMapTarget>,
  configDir: string,
): FileMapTarget | null {
  let exactMatch: FileMapTarget | undefined;
  let patternMatch: FileMapTarget | undefined;
  let patternSuffixLen = 0;

  for (const [key, target] of Object.entries(fileMap)) {
    if (key.startsWith("*")) {
      // Glob pattern: suffix match (e.g. "*.blade.php")
      const suffix = key.slice(1);
      if (absPath.endsWith(suffix) && suffix.length > patternSuffixLen) {
        patternMatch = target;
        patternSuffixLen = suffix.length;
      }
    } else {
      // Exact path match
      const resolvedKey = isAbsolute(key) ? key : resolve(configDir, key);
      if (absPath === resolvedKey) {
        exactMatch = target;
      }
    }
  }

  if (!exactMatch && !patternMatch) return null;
  if (!patternMatch) return exactMatch!;
  if (!exactMatch) return patternMatch!;

  return mergeFileMapTargets(patternMatch, exactMatch);
}

/**
 * Extract adapter mappings from typeMap.files for runtime use by PhpExecutor.
 * Resolves relative adapter paths against the config directory.
 */
function resolveAdapterMap(
  fileMap: Record<string, FileMapTarget> | undefined,
  configDir: string | undefined,
): AdapterMap | undefined {
  if (!fileMap) return undefined;
  const dir = configDir ?? process.cwd();
  const patterns: AdapterMap["patterns"] = [];
  const files: AdapterMap["files"] = {};

  for (const [key, target] of Object.entries(fileMap)) {
    if (!target.adapter) continue;
    const resolvedAdapter = isAbsolute(target.adapter)
      ? target.adapter
      : resolve(dir, target.adapter);

    if (key.startsWith("*")) {
      patterns.push({ suffix: key.slice(1), adapter: resolvedAdapter });
    } else {
      const resolvedKey = isAbsolute(key) ? key : resolve(dir, key);
      files[resolvedKey] = resolvedAdapter;
    }
  }

  return patterns.length > 0 || Object.keys(files).length > 0 ? { patterns, files } : undefined;
}

/**
 * Convert inline args definition to PhpArgMap code string.
 * Accepts string shorthand ("string", "?int") or ArgOverride objects.
 */
function inlineArgsToArgMap(args: Record<string, string | ArgOverride>): string {
  const entries = Object.entries(args);
  if (entries.length === 0) return "{}";

  const lines = entries.map(([name, def], position) => {
    let type: string;
    let nullable = false;
    let required = true;
    let defaultValue: unknown;
    let options: (string | number | boolean)[] | undefined;
    let elementType: string | undefined;

    if (typeof def === "string") {
      // String shorthand: "string", "?string", "bool"
      if (def.startsWith("?")) {
        nullable = true;
        type = def.slice(1);
        required = false;
      } else {
        type = def;
      }
    } else {
      type = def.type ?? "unknown";
      nullable = def.nullable ?? false;
      required = def.required ?? (def.default === undefined && !nullable);
      defaultValue = def.default;
      options = def.options;
      elementType = def.elementType;
    }

    const typeEscaped = type.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    const parts: string[] = [
      `type: '${typeEscaped}'`,
      `required: ${required}`,
      `position: ${position}`,
      `nullable: ${nullable}`,
    ];
    if (defaultValue !== undefined) {
      parts.push(`default: ${JSON.stringify(defaultValue)}`);
    }
    if (options !== undefined) {
      parts.push(`options: ${JSON.stringify(options)}`);
    }
    if (elementType !== undefined) {
      parts.push(`elementType: ${JSON.stringify(elementType)}`);
    }
    return `    ${name}: { ${parts.join(", ")} }`;
  });

  return `{\n${lines.join(",\n")}\n  }`;
}

/**
 * Generate a virtual module for a file mapped via typeMap.files with inline args.
 */
function generateMappedTemplateModule(filePath: string, allArgs: string): string {
  return `export default {
  __php: true,
  __type: 'template',
  __file: ${JSON.stringify(filePath)},
  __class: null,
  __callable: null,
  __constructorArgs: {},
  __callableArgs: {},
  __allArgs: ${allArgs},
};
`;
}

/**
 * Merge classes from additional PhpFileMetas into a base meta.
 * Used for cross-file parent class and trait resolution via typeMap.files[].includes.
 */
function mergeFileMetas(base: PhpFileMeta, ...extras: PhpFileMeta[]): PhpFileMeta {
  const mergedClasses = [...base.classes];
  const mergedFunctions = [...base.functions];
  const seenFqns = new Set(base.classes.map((c) => c.fqn));
  const seenFnFqns = new Set(base.functions.map((f) => f.fqn));

  for (const extra of extras) {
    for (const cls of extra.classes) {
      if (!seenFqns.has(cls.fqn)) {
        mergedClasses.push(cls);
        seenFqns.add(cls.fqn);
      }
    }
    for (const fn of extra.functions) {
      if (!seenFnFqns.has(fn.fqn)) {
        mergedFunctions.push(fn);
        seenFnFqns.add(fn.fqn);
      }
    }
  }

  return {
    filePath: base.filePath,
    namespace: base.namespace,
    classes: mergedClasses,
    functions: mergedFunctions,
  };
}

/**
 * Apply typeMap.args overrides to parsed PHP file metadata.
 * Key formats: "FQCN::$arg" (constructor), "FQCN::method::$arg" (method param).
 */
function applyArgOverrides(
  meta: PhpFileMeta,
  argOverrides: Record<string, string | ArgOverride>,
): void {
  for (const [key, override] of Object.entries(argOverrides)) {
    // Parse key: "FQCN::method::$arg" or "FQCN::$arg"
    const match = key.match(/^(.+?)::(?:(\w+)::\$(\w+)|\$(\w+))$/);
    if (!match) continue;

    const fqn = match[1]!;
    const methodName = match[2] ?? null;
    const paramName = match[3] ?? match[4]!;

    for (const cls of meta.classes) {
      if (cls.fqn !== fqn && cls.name !== fqn) continue;

      if (methodName) {
        // Method param override
        for (const method of cls.methods) {
          if (method.name !== methodName) continue;
          applyOverrideToParam(method.params, paramName, override);
        }
      } else {
        // Constructor param override
        applyOverrideToParam(cls.constructorParams, paramName, override);
      }
    }
  }
}

function applyOverrideToParam(
  params: PhpParamMeta[],
  paramName: string,
  override: string | ArgOverride,
): void {
  const param = params.find((p) => p.name === paramName) as
    | (PhpParamMeta & { options?: (string | number | boolean)[]; elementType?: string })
    | undefined;
  if (!param) return;

  if (typeof override === "string") {
    param.type = override;
  } else {
    if (override.type !== undefined) param.type = override.type;
    if (override.nullable !== undefined) param.nullable = override.nullable;
    if (override.required !== undefined) param.required = override.required;
    if (override.default !== undefined) param.default = override.default as string;
    if (override.options !== undefined) param.options = override.options;
    if (override.elementType !== undefined) param.elementType = override.elementType;
  }
}

/**
 * Core module generation logic for a PHP file.
 * Extracted so it can be called both from load() and from phpFile redirects.
 */
function loadPhpFile(
  filePath: string,
  callableName: string | null,
  options: FrameworkOptions,
): string {
  const configDir = options._configDir ?? process.cwd();

  // Parse the PHP file
  let meta = parsePhpFile(filePath);

  // Apply typeMap.files[].includes: merge additional file classes
  if (options.typeMap?.files) {
    const mapping = findFileMapping(filePath, options.typeMap.files, configDir);
    if (mapping?.includes) {
      const extras = mapping.includes.map((inc) => {
        const incPath = isAbsolute(inc) ? inc : resolve(configDir, inc);
        return parsePhpFile(incPath);
      });
      meta = mergeFileMetas(meta, ...extras);
    }
  }

  // Apply typeMap.args overrides
  if (options.typeMap?.args) {
    applyArgOverrides(meta, options.typeMap.args);
  }

  // Template mode -- default export
  if (!callableName) {
    return generateTemplateModule(filePath);
  }

  // Helper: recursively find a method in a trait's own trait chain
  const findMethodInTraitChain = (
    traitCls: PhpClassMeta,
    methodName: string,
    visited: Set<string> = new Set(),
  ): PhpMethodMeta | null => {
    if (visited.has(traitCls.fqn)) return null;
    visited.add(traitCls.fqn);

    const method = traitCls.methods.find((m) => m.name === methodName);
    if (method) return method;

    if (traitCls.traits && traitCls.traits.length > 0) {
      for (const innerTraitName of traitCls.traits) {
        const innerTrait = meta.classes.find(
          (c) => c.name === innerTraitName || c.fqn === innerTraitName,
        );
        if (innerTrait) {
          const found = findMethodInTraitChain(innerTrait, methodName, visited);
          if (found) return found;
        }
      }
    }
    return null;
  };

  // Helper: find a method on a class, its traits, or its parents
  const findMethodInHierarchy = (
    cls: PhpClassMeta,
    methodName: string,
  ): { cls: PhpClassMeta; method: PhpMethodMeta } | null => {
    const method = cls.methods.find((m) => m.name === methodName);
    if (method) return { cls, method };

    if (cls.traits && cls.traits.length > 0) {
      for (const traitName of cls.traits) {
        const trait = meta.classes.find((c) => c.name === traitName || c.fqn === traitName);
        if (trait) {
          const traitMethod = findMethodInTraitChain(trait, methodName);
          if (traitMethod) {
            return { cls, method: traitMethod };
          }
        }
      }
    }

    if (cls.extends) {
      const parent = meta.classes.find((c) => c.name === cls.extends || c.fqn === cls.extends);
      if (parent) {
        const found = findMethodInHierarchy(parent, methodName);
        if (found) {
          return { cls, method: found.method };
        }
      }
    }
    return null;
  };

  // Helper: resolve constructor params, traversing parents if the class has none
  const resolveConstructorParams = (cls: PhpClassMeta): PhpParamMeta[] => {
    if (cls.constructorParams.length > 0) return cls.constructorParams;
    if (cls.extends) {
      const parent = meta.classes.find((c) => c.name === cls.extends || c.fqn === cls.extends);
      if (parent) return resolveConstructorParams(parent);
    }
    return [];
  };

  // Collect ALL matching exports
  const modules: string[] = [];

  // Helper: find a method on an enum, checking traits recursively if needed
  const findEnumMethod = (cls: PhpClassMeta, methodName: string): PhpMethodMeta | null => {
    const method = cls.methods.find((m) => m.name === methodName);
    if (method) return method;

    if (cls.traits && cls.traits.length > 0) {
      for (const traitName of cls.traits) {
        const trait = meta.classes.find((c) => c.name === traitName || c.fqn === traitName);
        if (trait) {
          const traitMethod = findMethodInTraitChain(trait, methodName);
          if (traitMethod) return traitMethod;
        }
      }
    }
    return null;
  };

  // Search classes/enums for the callable
  for (const cls of meta.classes) {
    if (cls.isTrait || cls.isInterface) {
      continue;
    }

    if (cls.isEnum) {
      const method = findEnumMethod(cls, callableName);
      if (method) {
        if (method.isStatic) {
          modules.push(generateStaticMethodModule(filePath, cls, method, callableName));
        } else {
          modules.push(generateEnumMethodModule(filePath, cls, method, callableName));
        }
      }
      continue;
    }

    if (cls.isAbstract) {
      const method = cls.methods.find((m) => m.name === callableName && m.isStatic);
      if (method) {
        modules.push(generateStaticMethodModule(filePath, cls, method, callableName));
      }
      continue;
    }

    const found = findMethodInHierarchy(cls, callableName);
    if (found) {
      if (found.method.isStatic) {
        const definedDirectly = cls.methods.some((m) => m.name === callableName);
        if (definedDirectly) {
          modules.push(generateStaticMethodModule(filePath, found.cls, found.method, callableName));
        }
      } else {
        const ctorParams = resolveConstructorParams(found.cls);
        modules.push(
          generateClassMethodModule(filePath, found.cls, found.method, callableName, ctorParams),
        );
      }
    }
  }

  if (modules.length > 0) {
    return modules.join("\n");
  }

  // Search standalone functions
  for (const fn of meta.functions) {
    if (fn.name === callableName) {
      return generateFunctionModule(filePath, fn, callableName);
    }
  }

  // Not found
  return `throw new Error('PHP callable "${callableName}" not found in ${filePath}');`;
}

export function storybookPhpPlugin(options: FrameworkOptions = {}): Plugin {
  return {
    name: "storybook-php",
    enforce: "pre",

    resolveId(source: string, importer: string | undefined) {
      // TypeMap file mappings checked first (e.g. .blade.php that also matches PHP_RE)
      if (options.typeMap?.files && importer) {
        const sourcePath = source.replace(/@\w+$/, "");
        const absPath = isAbsolute(sourcePath)
          ? sourcePath
          : resolve(dirname(importer), sourcePath);
        const configDir = options._configDir ?? process.cwd();
        const mapping = findFileMapping(absPath, options.typeMap.files, configDir);
        if (mapping) {
          const callable = source.match(/@(\w+)$/)?.[1] ?? options.defaultMethod ?? null;
          return `${VIRTUAL_PREFIX}${absPath}?callable=${callable ?? ""}&mapped=1`;
        }
      }

      // Standard .php imports
      const match = source.match(PHP_RE);
      if (match) {
        const callable = match[1] ?? options.defaultMethod ?? null;
        const phpPath = source.replace(/@\w+$/, "");

        let absPath: string;
        if (isAbsolute(phpPath)) {
          absPath = phpPath;
        } else if (importer) {
          absPath = resolve(dirname(importer), phpPath);
        } else {
          return null;
        }

        return `${VIRTUAL_PREFIX}${absPath}?callable=${callable ?? ""}`;
      }

      return null;
    },

    load(id: string) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return null;

      const rest = id.slice(VIRTUAL_PREFIX.length);
      const qIdx = rest.indexOf("?");
      const filePath = qIdx === -1 ? rest : rest.slice(0, qIdx);
      const query = qIdx === -1 ? "" : rest.slice(qIdx + 1);
      const params = new URLSearchParams(query);
      const callableName = params.get("callable") || null;
      const isMapped = params.get("mapped") === "1";

      const configDir = options._configDir ?? process.cwd();

      // Handle typeMap.files mapped imports
      if (isMapped && options.typeMap?.files) {
        const mapping = findFileMapping(filePath!, options.typeMap.files, configDir);
        if (mapping) {
          // Inline args: generate template module with provided type info
          if (mapping.args) {
            const allArgs = inlineArgsToArgMap(mapping.args);
            return generateMappedTemplateModule(filePath!, allArgs);
          }

          // phpFile redirect: parse the referenced PHP file and generate module from it
          if (mapping.phpFile) {
            const phpFilePath = isAbsolute(mapping.phpFile)
              ? mapping.phpFile
              : resolve(configDir, mapping.phpFile);
            const redirectCallable = mapping.callable ?? callableName;
            return loadPhpFile(phpFilePath, redirectCallable, options);
          }

          // Other mappings (adapter-only, includes-only): fall through to
          // loadPhpFile which handles includes resolution and generates the
          // appropriate module. For non-PHP files (e.g. .blade.php) with null
          // callable, loadPhpFile returns a template module with empty args.
        }
      }

      return loadPhpFile(filePath!, callableName, options);
    },

    configureServer(server: ViteDevServer) {
      const configDir = options._configDir ?? process.cwd();
      const middleware = createPhpMiddleware({
        phpBinary: options.phpBinary,
        timeout: options.timeout,
        bootstrap: options.bootstrap,
        adapter: options.adapter,
        typeMap: options.typeMap,
        adapterMap: resolveAdapterMap(options.typeMap?.files, configDir),
      });
      server.middlewares.use(middleware as any);
    },

    handleHotUpdate({ file, server }) {
      // Check if file is relevant: .php files, or files referenced in typeMap
      let isRelevant = file.endsWith(".php");

      if (!isRelevant && options.typeMap?.files) {
        const configDir = options._configDir ?? process.cwd();
        // Check if the changed file is a typeMap.files key
        if (findFileMapping(file, options.typeMap.files, configDir)) {
          isRelevant = true;
        }
        // Check if the changed file is referenced as phpFile or includes
        for (const target of Object.values(options.typeMap.files)) {
          if (target.phpFile) {
            const phpPath = isAbsolute(target.phpFile)
              ? target.phpFile
              : resolve(configDir, target.phpFile);
            if (file === phpPath) {
              isRelevant = true;
              break;
            }
          }
          if (target.includes) {
            for (const inc of target.includes) {
              const incPath = isAbsolute(inc) ? inc : resolve(configDir, inc);
              if (file === incPath) {
                isRelevant = true;
                break;
              }
            }
          }
        }
      }

      if (!isRelevant) return;

      // Invalidate all virtual modules derived from this file
      const mods = [...server.moduleGraph.idToModuleMap.values()].filter(
        (mod) => mod.id?.startsWith(VIRTUAL_PREFIX) && mod.id.includes(file),
      );

      if (mods.length > 0) {
        mods.forEach((mod) => server.moduleGraph.invalidateModule(mod));
        server.ws.send({ type: "full-reload" });
        return [];
      }
    },
  };
}

export { VIRTUAL_PREFIX, resolveAdapterMap };
