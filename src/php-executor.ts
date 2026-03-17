import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import type { PhpRenderRequest, PhpRenderResponse } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface PhpExecutorOptions {
  phpBinary?: string;
  timeout?: number;
  bootstrap?: string;
  adapter?: string;
}

export class PhpExecutor {
  private phpBinary: string;
  private timeout: number;
  private bootstrap: string | null;
  private adapter: string | null;
  private runnerPath: string;

  constructor(options: PhpExecutorOptions = {}) {
    this.phpBinary = options.phpBinary ?? 'php';
    this.timeout = options.timeout ?? 5000;
    this.bootstrap = options.bootstrap ?? null;
    this.adapter = options.adapter ?? null;
    this.runnerPath = this.resolveRunnerPath();
  }

  /**
   * Try to find runner.php in multiple locations depending on whether
   * we're running from dist/ (compiled) or src/ (dev/test).
   */
  private resolveRunnerPath(): string {
    const candidates = [
      resolve(__dirname, '..', 'src', 'php', 'runner.php'), // from dist/
      resolve(__dirname, 'php', 'runner.php'),               // from src/
      resolve(__dirname, '..', 'php', 'runner.php'),         // fallback
    ];
    for (const p of candidates) {
      if (existsSync(p)) return p;
    }
    return candidates[0]!; // default, will error at runtime
  }

  async execute(request: PhpRenderRequest): Promise<PhpRenderResponse> {
    const input = JSON.stringify({
      ...request,
      bootstrap: request.bootstrap ?? this.bootstrap,
      adapter: request.adapter ?? this.adapter,
    });

    return new Promise((resolvePromise) => {
      const proc = spawn(this.phpBinary, [this.runnerPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: this.timeout,
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      proc.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          resolvePromise({
            html: '',
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
            html: '',
            error: `Invalid JSON from PHP: ${stdout.slice(0, 200)}`,
            trace: stderr,
          });
        }
      });

      proc.on('error', (err: Error) => {
        resolvePromise({
          html: '',
          error: `Failed to spawn PHP: ${err.message}`,
        });
      });

      proc.stdin.write(input);
      proc.stdin.end();
    });
  }
}
