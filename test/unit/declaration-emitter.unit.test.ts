import { describe, expect, it } from "vite-plus/test";
import { generateDeclarationModule } from "../../src/core/component/declaration-emitter.js";

describe("declaration-emitter", () => {
  it("uses a sanitized callable name for class exports", () => {
    const declaration = generateDeclarationModule([
      {
        exportName: "FancyCard",
        renderPlan: {
          type: "classMethod",
          file: "/tmp/fancy.php",
          sourceFile: "/tmp/fancy.php",
          class: "App\\FancyCard",
          callable: "App\\Ui\\render-card",
        },
        constructorArgs: {},
        callableArgs: {},
        publicArgs: {
          title: { type: "string", required: true, position: 0, nullable: false },
        },
      },
    ]);

    expect(declaration).toContain("interface FancyCard_render_card_Args");
  });

  it("falls back to template for missing callable names", () => {
    const declaration = generateDeclarationModule([
      {
        exportName: "PartialView",
        renderPlan: {
          type: "classMethod",
          file: "/tmp/view.php",
          sourceFile: "/tmp/view.php",
          class: "App\\PartialView",
          callable: null,
        },
        constructorArgs: {},
        callableArgs: {},
        publicArgs: {
          body: { type: "string", required: true, position: 0, nullable: false },
        },
      },
    ]);

    expect(declaration).toContain("interface PartialView_template_Args");
  });

  it("falls back to template when the callable name sanitizes to an empty string", () => {
    const declaration = generateDeclarationModule([
      {
        exportName: "Symbolic",
        renderPlan: {
          type: "classMethod",
          file: "/tmp/symbolic.php",
          sourceFile: "/tmp/symbolic.php",
          class: "App\\Symbolic",
          callable: "!!!",
        },
        constructorArgs: {},
        callableArgs: {},
        publicArgs: {
          body: { type: "string", required: true, position: 0, nullable: false },
        },
      },
    ]);

    expect(declaration).toContain("interface Symbolic_template_Args");
  });
});
