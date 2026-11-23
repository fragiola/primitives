// The entry of @fragiola/primitives-react/tag-group: a focusable group of tags to move through,
// select and remove (spec/tag-group.md, React Aria's grid of tags). Its keys are the toolkit's
// `/collection`, its selection rules `/selection`.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export { TagGroup } from "./parts.ts";
export type { TagGroupListState } from "./tag-group-list.tsx";
export type { TagGroupRemoveButtonState } from "./tag-group-remove-button.tsx";
export type {
    TagGroupRootProps,
    TagGroupRootState,
    TagGroupSelectionMode,
} from "./tag-group-root.tsx";
export type { TagGroupTagProps, TagGroupTagState } from "./tag-group-tag.tsx";
