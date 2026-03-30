import { createHash } from "node:crypto";
import type { PhpArgMap, PhpRenderPlan } from "../../types.js";

interface RegisteredRenderTarget {
  plan: PhpRenderPlan;
  argDefs: PhpArgMap | null;
}

export class RenderRegistry {
  private plans = new Map<string, RegisteredRenderTarget>();

  register(plan: PhpRenderPlan, argDefs: PhpArgMap | null = null): string {
    const id = createHash("sha1")
      .update(
        JSON.stringify({
          type: plan.type,
          file: plan.file,
          sourceFile: plan.sourceFile,
          class: plan.class,
          callable: plan.callable,
          adapter: plan.adapter ?? null,
        }),
      )
      .digest("hex")
      .slice(0, 12);

    this.plans.set(id, { plan, argDefs });
    return id;
  }

  get(id: string): RegisteredRenderTarget | null {
    return this.plans.get(id) ?? null;
  }
}
