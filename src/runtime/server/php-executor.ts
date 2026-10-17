import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import type {
  PhpRenderRequest,
  PhpRenderResponse,
  AdapterMap,
  TypeMappings,
  ComponentsConfig,
} from "../../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface PhpExecutorOptions {
  phpBinary?: string;
  phpOptions?: string[];
  phpEnv?: Record<string, string>;
  timeout?: number;
  bootstrap?: string;
  adapter?: string;
  components?: ComponentsConfig;
  types?: TypeMappings;
  /** Pre-resolved adapter mappings from components.files (patterns + exact paths) */
  adapterMap?: AdapterMap;
}

export class PhpExecutor {
  private phpBinary: string;
  private phpOptions: string[];
  private phpEnv: Record<string, string> | null;
  private timeout: number;
  private bootstrap: string | null;
  private adapter: string | null;
  private adapterMap: AdapterMap | null;
  private runnerPath: string;
  private types: TypeMappings | null;
  private components: Pick<ComponentsConfig, "classes"> | null;

  constructor(options: PhpExecutorOptions = {}) {
    this.phpBinary = options.phpBinary ?? "php";
    this.phpOptions = options.phpOptions ?? [];
    this.phpEnv = options.phpEnv ?? null;
    this.timeout = options.timeout ?? 5000;
    this.bootstrap = options.bootstrap ?? null;
    this.adapter = options.adapter ?? null;
    this.adapterMap = options.adapterMap ?? null;
    this.runnerPath = this.resolveRunnerPath();
    this.types = options.types ?? null;
    this.components = options.components?.classes ? { classes: options.components.classes } : null;
    if ("typeMap" in options) {
      throw new Error("typeMap is no longer supported. Use components and types.");
    }
  }

  /**
   * Try to find runner.php in multiple locations depending on whether
   * we're running from dist/ (compiled) or src/runtime/server/ (dev/test).
   */
  private resolveRunnerPath(): string {
    const candidates = [
      resolve(__dirname, "..", "src", "php", "runner.php"), // from dist/
      resolve(__dirname, "..", "..", "..", "src", "php", "runner.php"), // from dist/runtime/server/
      resolve(__dirname, "..", "..", "php", "runner.php"), // from src/runtime/server/
      resolve(__dirname, "php", "runner.php"), // fallback for legacy layouts
    ];
    for (const p of candidates) {
      if (existsSync(p)) return p;
    }
    return candidates[0]!; // default, will error at runtime
  }

  /**
   * Resolve all per-file adapters from adapterMap.
   * Middleware order is outer → inner:
   *   matching patterns (least specific → most specific), then exact file adapter.
   */
  private resolveFileAdapters(filePath: string): string[] {
    if (!this.adapterMap) return [];

    const matchedPatterns = this.adapterMap.patterns
      .filter(({ suffix }) => filePath.endsWith(suffix))
      .sort((a, b) => a.suffix.length - b.suffix.length)
      .map(({ adapter }) => adapter);

    const exactAdapter = this.adapterMap.files[filePath];
    return exactAdapter ? [...matchedPatterns, exactAdapter] : matchedPatterns;
  }

  /**
   * Compose the final adapter middleware chain from least specific to most specific.
   */
  private resolveAdapterChain(
    filePath: string,
    requestAdapter: string | null | undefined,
  ): string[] {
    const chain = [this.adapter, ...this.resolveFileAdapters(filePath), requestAdapter].filter(
      (value): value is string => typeof value === "string" && value !== "",
    );

    return [...new Set(chain)];
  }

  async execute(request: PhpRenderRequest): Promise<PhpRenderResponse> {
    const { types, adapter: requestAdapter, ...rest } = request;
    const adapters = this.resolveAdapterChain(rest.sourceFile ?? rest.file, requestAdapter);

    const input = JSON.stringify({
      ...rest,
      bootstrap: request.bootstrap ?? this.bootstrap,
      adapters: adapters.length > 0 ? adapters : null,
      types: { ...this.types, ...types },
      components: request.components ?? this.components,
    });

    return new Promise((resolvePromise) => {
      const proc = spawn(this.phpBinary, [...this.phpOptions, this.runnerPath], {
        stdio: ["pipe", "pipe", "pipe"],
        timeout: this.timeout,
        ...(this.phpEnv ? { env: { ...process.env, ...this.phpEnv } } : {}),
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      proc.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      proc.on("close", (code) => {
        if (code !== 0) {
          resolvePromise({
            html: "",
            error: stderr || `PHP process exited with code ${code}`,
            trace: stderr,
          });
          return;
        }
        try {
          const result = JSON.parse(stdout) as PhpRenderResponse;
          resolvePromise(result);
        } catch {
          resolvePromise({
            html: "",
            error: `Invalid JSON from PHP: ${stdout.slice(0, 200)}`,
            trace: stderr,
          });
        }
      });

      proc.on("error", (err: Error) => {
        resolvePromise({
          html: "",
          error: `Failed to spawn PHP: ${err.message}`,
        });
      });

      proc.stdin.write(input);
      proc.stdin.end();
    });
  }
}
