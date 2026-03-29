import { createHash } from "node:crypto";
import type { PhpRenderPlan } from "../types.js";

export class RenderRegistry {
  private plans = new Map<string, PhpRenderPlan>();

  register(plan: PhpRenderPlan): string {
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

    this.plans.set(id, plan);
    return id;
  }

  get(id: string): PhpRenderPlan | null {
    return this.plans.get(id) ?? null;
  }
}
