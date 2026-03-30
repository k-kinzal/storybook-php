import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { EventEmitter } from "node:events";
import type { PhpRenderRequest } from "../../src/types.js";

describe("php-executor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("falls back to the default runner path and accumulates stderr output", async () => {
    vi.doMock("node:fs", async () => {
      const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
      return {
        ...actual,
        existsSync: vi.fn(() => false),
      };
    });

    const spawnMock = vi.fn(() => {
      const proc = new EventEmitter() as EventEmitter & {
        stdout: EventEmitter;
        stderr: EventEmitter;
        stdin: { write(chunk: string): void; end(): void };
      };
      proc.stdout = new EventEmitter();
      proc.stderr = new EventEmitter();
      proc.stdin = {
        write: vi.fn(),
        end: vi.fn(),
      };
      return proc;
    });

    vi.doMock("node:child_process", () => ({
      spawn: spawnMock,
    }));

    const { PhpExecutor } = await import("../../src/runtime/server/php-executor.js");
    const executor = new PhpExecutor() as unknown as {
      runnerPath: string;
      execute(request: PhpRenderRequest): Promise<{ html: string; error?: string; trace?: string }>;
    };

    expect(executor.runnerPath).toContain("src/php/runner.php");

    const request: PhpRenderRequest = {
      type: "template",
      file: "/tmp/template.php",
      class: null,
      callable: null,
      args: {},
    };

    const resultPromise = executor.execute(request);
    const spawned = spawnMock.mock.results[0]?.value as EventEmitter & {
      stdout: EventEmitter;
      stderr: EventEmitter;
      stdin: { write: (chunk: string) => void; end: () => void };
    };
    spawned.stderr.emit("data", Buffer.from("stderr failure"));
    spawned.emit("close", 1);

    const result = await resultPromise;

    expect(result).toEqual({
      html: "",
      error: "stderr failure",
      trace: "stderr failure",
    });
    expect(spawned.stdin.write).toHaveBeenCalled();
    expect(spawned.stdin.end).toHaveBeenCalled();
  });

  it("serializes adapter middleware in outer-to-inner order", async () => {
    let written = "";

    vi.doMock("node:child_process", () => ({
      spawn: vi.fn(() => {
        const proc = new EventEmitter() as EventEmitter & {
          stdout: EventEmitter;
          stderr: EventEmitter;
          stdin: { write(chunk: string): void; end(): void };
        };
        proc.stdout = new EventEmitter();
        proc.stderr = new EventEmitter();
        proc.stdin = {
          write(chunk: string) {
            written += chunk;
          },
          end() {
            proc.stdout.emit("data", Buffer.from(JSON.stringify({ html: "<div>ok</div>" })));
            proc.emit("close", 0);
          },
        };
        return proc;
      }),
    }));

    const { PhpExecutor } = await import("../../src/runtime/server/php-executor.js");
    const executor = new PhpExecutor({
      adapter: "/global.php",
      adapterMap: {
        patterns: [
          { suffix: ".php", adapter: "/pattern-outer.php" },
          { suffix: "Card.blade.php", adapter: "/pattern-inner.php" },
        ],
        files: {
          "/stories/Card.blade.php": "/exact.php",
        },
      },
    });

    const result = await executor.execute({
      type: "template",
      file: "/runtime/card-render.php",
      sourceFile: "/stories/Card.blade.php",
      class: null,
      callable: null,
      args: {},
      adapter: "/story.php",
    });

    expect(result).toEqual({ html: "<div>ok</div>" });
    expect(JSON.parse(written)).toMatchObject({
      adapters: [
        "/global.php",
        "/pattern-outer.php",
        "/pattern-inner.php",
        "/exact.php",
        "/story.php",
      ],
    });
  });
});
