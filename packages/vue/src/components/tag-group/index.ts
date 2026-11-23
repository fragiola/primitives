// The entry of @fragiola/primitives-vue/tag-group: a focusable group of tags to move through,
// select and remove (spec/tag-group.md, React Aria's grid of tags). Its keys are the toolkit's
// `/collection`, its selection rules `/selection`.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { TagGroup } from "./parts.ts";
export type { TagGroupListState } from "./tag-group-list.ts";
export type { TagGroupRemoveButtonState } from "./tag-group-remove-button.ts";
export type {
    TagGroupRootEmits,
    TagGroupRootProps,
    TagGroupRootState,
    TagGroupSelectionMode,
} from "./tag-group-root.ts";
export type { TagGroupTagProps, TagGroupTagState } from "./tag-group-tag.ts";
