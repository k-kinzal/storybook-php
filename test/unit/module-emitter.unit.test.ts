import { describe, expect, it } from "vite-plus/test";
import { generateVirtualModule } from "../../src/core/component/module-emitter.js";

describe("module-emitter", () => {
  it("emits a default error when no schemas are present", () => {
    expect(generateVirtualModule([])).toContain("Unknown storybook-php module error");
  });

  it("serializes extended arg metadata fields", () => {
    const code = generateVirtualModule([
      {
        exportName: "Widget",
        componentId: "cmp_1",
        renderPlan: {
          type: "classMethod",
          file: "/tmp/widget.php",
          sourceFile: "/tmp/widget.php",
          class: "App\\Widget",
          callable: "render",
        },
        constructorArgs: {},
        callableArgs: {},
        allArgs: {
          items: {
            type: "App\\Dto\\Item[]",
            required: false,
            position: 0,
            nullable: false,
            default: [],
            isVariadic: false,
            isPromoted: true,
            visibility: "private",
            options: ["a", "b"],
            elementType: "App\\Dto\\Item",
            enumType: "App\\Enums\\Mode",
            classType: "App\\Dto\\ItemList",
            unionTypes: ["array", "Traversable"],
          },
        },
      },
    ]);

    expect(code).toContain('elementType: "App\\\\Dto\\\\Item"');
    expect(code).toContain('enumType: "App\\\\Enums\\\\Mode"');
    expect(code).toContain('classType: "App\\\\Dto\\\\ItemList"');
    expect(code).toContain('unionTypes: ["array","Traversable"]');
  });
});
