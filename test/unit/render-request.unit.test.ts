import { describe, expect, it } from "vite-plus/test";
import { RenderRegistry } from "../../src/runtime/render/render-registry.js";
import {
  parseRenderInvokeRequest,
  RequestValidationError,
  resolveExecutionRequest,
} from "../../src/runtime/render/render-request.js";

describe("render-request", () => {
  describe("parseRenderInvokeRequest", () => {
    it("throws a validation error for invalid JSON", () => {
      expect(() => parseRenderInvokeRequest("{invalid")).toThrowError(RequestValidationError);
      expect(() => parseRenderInvokeRequest("{invalid")).toThrowError("Invalid JSON body");
    });

    it("throws a validation error for non-object JSON", () => {
      expect(() => parseRenderInvokeRequest("null")).toThrowError(RequestValidationError);
      expect(() => parseRenderInvokeRequest("null")).toThrowError(
        "Render request body must be a JSON object",
      );
    });

    it("requires componentId and args", () => {
      expect(() => parseRenderInvokeRequest(JSON.stringify({ args: {} }))).toThrowError(
        "Render request body must include componentId",
      );
      expect(() => parseRenderInvokeRequest(JSON.stringify({ componentId: "cmp_1" }))).toThrowError(
        'Render request body field "args" must be a JSON object',
      );
      expect(() =>
        parseRenderInvokeRequest(JSON.stringify({ componentId: "cmp_1", args: {}, php: [] })),
      ).toThrowError('Render request body field "php" must be a JSON object or null');
    });
  });

  describe("resolveExecutionRequest", () => {
    it("builds a request from a registry plan", () => {
      const registry = new RenderRegistry();
      const componentId = registry.register(
        {
          type: "classMethod",
          file: "/runtime/Card.php",
          sourceFile: "/stories/Card.php",
          class: "App\\Card",
          callable: "render",
          adapter: "/runtime/default-adapter.php",
        },
        {
          title: { type: "string", required: true, position: 0, nullable: false },
        },
        {
          title: { type: "string", required: true, position: 0, nullable: false },
        },
        {},
      );

      const request = resolveExecutionRequest(
        {
          componentId,
          args: { title: "Hello" },
          php: {
            types: {
              "App\\Contracts\\Card": "App\\Card",
              "App\\Card::$meta": { value: { theme: "dark" } },
            },
          },
        },
        registry,
      );

      expect(request).toEqual({
        type: "classMethod",
        file: "/runtime/Card.php",
        sourceFile: "/stories/Card.php",
        class: "App\\Card",
        callable: "render",
        args: { title: "Hello" },
        publicArgDefs: {
          title: { type: "string", required: true, position: 0, nullable: false },
        },
        constructorArgDefs: {
          title: { type: "string", required: true, position: 0, nullable: false },
        },
        callableArgDefs: {},
        bootstrap: null,
        adapter: "/runtime/default-adapter.php",
        types: {
          "App\\Contracts\\Card": "App\\Card",
          "App\\Card::$meta": { value: { theme: "dark" } },
        },
      });
    });

    it("throws when component ids are used without a registry", () => {
      expect(() =>
        resolveExecutionRequest({ componentId: "missing", args: {} }, undefined),
      ).toThrowError(new RequestValidationError("Component registry is not available."));
    });

    it("throws for unknown component ids", () => {
      const registry = new RenderRegistry();

      expect(() =>
        resolveExecutionRequest({ componentId: "missing", args: {} }, registry),
      ).toThrowError(new RequestValidationError("Unknown componentId: missing"));
    });

    it("normalizes missing adapters from registry plans to null", () => {
      const registry = new RenderRegistry();
      const componentId = registry.register({
        type: "template",
        file: "/tmp/view.php",
        sourceFile: "/tmp/view.php",
        class: null,
        callable: null,
      });

      expect(resolveExecutionRequest({ componentId, args: {} }, registry).adapter).toBeNull();
      expect(resolveExecutionRequest({ componentId, args: {} }, registry).publicArgDefs).toBeNull();
    });

    it("forwards story-level class contracts as runtime type information", () => {
      const registry = new RenderRegistry();
      const componentId = registry.register({
        type: "classMethod",
        file: "/tmp/Menu.php",
        sourceFile: "/tmp/Menu.php",
        class: "App\\Menu",
        callable: "render",
      });
      const types = { "App\\Menu::$sections": "App\\MenuSection[]" };

      expect(
        resolveExecutionRequest({ componentId, args: {}, php: { types } }, registry).types,
      ).toEqual(types);
      expect(
        resolveExecutionRequest(
          { componentId, args: {}, php: { component: { args: {} } } },
          registry,
        ).types,
      ).toBeNull();
    });

    it("merges story-level public args overrides into registry arg defs", () => {
      const registry = new RenderRegistry();
      const componentId = registry.register(
        {
          type: "classMethod",
          file: "/runtime/Card.php",
          sourceFile: "/stories/Card.php",
          class: "App\\Card",
          callable: "render",
        },
        {
          title: { type: "string", required: true, position: 0, nullable: false },
        },
        {
          title: { type: "string", required: true, position: 0, nullable: false },
        },
        {
          title: { type: "string", required: false, position: 0, nullable: true },
        },
      );

      const request = resolveExecutionRequest(
        {
          componentId,
          args: { "method.title": "Preview" },
          php: {
            component: {
              args: {
                "method.title": { type: "?string", default: "Preview" },
              },
            },
          },
        },
        registry,
      );

      expect(request.publicArgDefs).toMatchObject({
        "method.title": {
          type: "string",
          nullable: true,
          default: "Preview",
        },
      });
    });
  });
  it("rejects legacy and malformed story configuration", () => {
    expect(() =>
      parseRenderInvokeRequest(JSON.stringify({ componentId: "cmp", args: {}, typeMap: {} })),
    ).toThrow("Use php.component and php.types");
    for (const php of [{ component: [] }, { types: [] }]) {
      expect(() =>
        parseRenderInvokeRequest(JSON.stringify({ componentId: "cmp", args: {}, php })),
      ).toThrow("must be a JSON object");
    }
  });
});
