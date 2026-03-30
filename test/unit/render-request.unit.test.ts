import { describe, expect, it } from "vite-plus/test";
import { RenderRegistry } from "../../src/runtime/render/render-registry.js";
import {
  parseRenderInvokeRequest,
  RequestValidationError,
  resolveExecutionRequest,
} from "../../src/runtime/render/render-request.js";
import type { PhpRenderInvokeRequest } from "../../src/types.js";

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
  });

  describe("resolveExecutionRequest", () => {
    it("builds a request from a registry plan and preserves request overrides", () => {
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
          bootstrap: "/bootstrap/app.php",
          adapter: "/runtime/story-adapter.php",
          typeMap: {
            bindings: { "App\\Contracts\\Card": "App\\Card" },
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
        bootstrap: "/bootstrap/app.php",
        adapter: "/runtime/story-adapter.php",
        typeMap: {
          bindings: { "App\\Contracts\\Card": "App\\Card" },
        },
      });
    });

    it("normalizes malformed optional legacy fields to null-safe defaults", () => {
      const malformed = {
        type: "template",
        file: "/stories/template.php",
        sourceFile: 42,
        class: false,
        callable: { name: "render" },
        args: [],
        bootstrap: 7,
        adapter: 9,
        typeMap: [],
      } as unknown as PhpRenderInvokeRequest;

      const request = resolveExecutionRequest(malformed, undefined);

      expect(request).toEqual({
        type: "template",
        file: "/stories/template.php",
        sourceFile: null,
        class: null,
        callable: null,
        args: {},
        publicArgDefs: null,
        constructorArgDefs: null,
        callableArgDefs: null,
        bootstrap: null,
        adapter: null,
        typeMap: null,
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
          typeMap: {
            args: {
              "method.title": { type: "?string", default: "Preview" },
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
});
