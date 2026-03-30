import { describe, expect, it } from "vite-plus/test";
import {
  buildPublicArgMap,
  mergePublicArgOverrides,
} from "../../src/core/component/public-args.js";

describe("public-args", () => {
  it("keeps a flat public arg when constructor and method metadata are compatible", () => {
    const publicArgs = buildPublicArgMap(
      {
        title: { type: "string", required: true, position: 0, nullable: false },
      },
      {
        title: {
          type: "string",
          required: false,
          position: 0,
          nullable: false,
          default: "Preview",
        },
      },
    );

    expect(publicArgs).toMatchObject({
      title: {
        type: "string",
      },
    });
    expect(publicArgs).not.toHaveProperty("constructor.title");
    expect(publicArgs).not.toHaveProperty("method.title");
  });

  it("splits conflicting constructor and method metadata into namespaced public args", () => {
    const publicArgs = buildPublicArgMap(
      {
        title: { type: "string", required: true, position: 0, nullable: false },
      },
      {
        title: { type: "App\\View\\HtmlBlock", required: true, position: 0, nullable: false },
      },
    );

    expect(publicArgs).toHaveProperty("constructor.title");
    expect(publicArgs).toHaveProperty("method.title");
    expect(publicArgs).not.toHaveProperty("title");
  });

  it("removes the auto-generated flat arg when namespaced overrides are supplied", () => {
    const merged = mergePublicArgOverrides(
      {
        title: { type: "string", required: true, position: 0, nullable: false },
      },
      {
        title: { type: "string", required: true, position: 0, nullable: false },
      },
      {
        title: { type: "string", required: true, position: 0, nullable: false },
      },
      {
        "constructor.title": "string",
        "method.title": "?string",
      },
    );

    expect(merged).not.toHaveProperty("title");
    expect(merged).toMatchObject({
      "constructor.title": {
        type: "string",
        nullable: false,
      },
      "method.title": {
        type: "string",
        nullable: true,
      },
    });
  });

  it("normalizes nullable object overrides written as ?type", () => {
    const merged = mergePublicArgOverrides(
      {},
      {},
      {
        title: { type: "string", required: true, position: 0, nullable: false },
      },
      {
        "method.title": { type: "?string", default: "Preview" },
      },
    );

    expect(merged["method.title"]).toMatchObject({
      type: "string",
      nullable: true,
      default: "Preview",
    });
  });
});
