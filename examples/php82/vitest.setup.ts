import { vis } from "storybook-addon-vis/vitest-setup";
import { prepareScreenshot } from "../_shared/prepare-screenshot.mjs";

declare const __VRT_COMPARE__: boolean;

vis.setup({
  auto: async () => {
    await prepareScreenshot();
    return __VRT_COMPARE__;
  },
});
