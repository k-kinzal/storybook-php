import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { EventEmitter } from "node:events";
import type { PhpRenderRequest } from "../types.js";

describe("mocked coverage extras", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("deduplicates schemas before emitting declarations", async () => {
    const duplicatedSchema = {
      exportName: "Card",
      renderPlan: {
        type: "classMethod" as const,
        file: "/tmp/Card.php",
        sourceFile: "/tmp/Card.php",
        class: "App\\Card",
        callable: "render",
      },
      constructorArgs: {},
      callableArgs: {},
      allArgs: {},
    };

    vi.doMock("../core/component/component-source.js", () => ({
      listCallableNamesFromMeta: () => ["render"],
      resolveComponentSource: vi.fn(),
    }));
    vi.doMock("../core/component/schema-builder.js", () => ({
      buildSchemasFromMeta: () => [duplicatedSchema, duplicatedSchema],
      buildTemplateSchema: vi.fn(),
    }));

    const { generateDts } = await import("../core/typescript/typegen.js");
    const output = generateDts({
      filePath: "/tmp/Card.php",
      namespace: null,
      classes: [],
      functions: [],
    });

    expect(output.match(/export declare const Card/g)).toHaveLength(1);
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

    const { PhpExecutor } = await import("../runtime/server/php-executor.js");
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
      stdin: { write(chunk: string): void; end(): void };
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
});
