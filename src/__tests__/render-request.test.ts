import { describe, expect, it } from "vite-plus/test";
import { RenderRegistry } from "../runtime/render/render-registry.js";
import {
  parseRenderInvokeRequest,
  RequestValidationError,
  resolveExecutionRequest,
} from "../runtime/render/render-request.js";
import type { PhpRenderInvokeRequest } from "../types.js";

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
      const componentId = registry.register({
        type: "classMethod",
        file: "/runtime/Card.php",
        sourceFile: "/stories/Card.php",
        class: "App\\Card",
        callable: "render",
        adapter: "/runtime/default-adapter.php",
      });

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
        bootstrap: null,
        adapter: null,
        typeMap: null,
      });
    });
  });
});
