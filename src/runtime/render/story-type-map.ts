import type { StoryTypeMap } from "../../types.js";

export function mergeStoryTypeMaps(
  base: { bindings?: Record<string, string>; args?: Record<string, unknown> } | null,
  storyTypeMap: StoryTypeMap | null | undefined,
): { bindings?: Record<string, string>; args?: Record<string, unknown> } | null {
  if (!base && !storyTypeMap) return null;
  if (!storyTypeMap) return base;
  if (!base) return storyTypeMap;
  return {
    ...(base.bindings || storyTypeMap.bindings
      ? { bindings: { ...base.bindings, ...storyTypeMap.bindings } }
      : {}),
    ...(base.args || storyTypeMap.args ? { args: { ...base.args, ...storyTypeMap.args } } : {}),
  };
}
