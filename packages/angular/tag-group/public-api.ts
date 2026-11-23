// The entry of @fragiola/primitives-angular/tag-group: a focusable group of tags to move through,
// select and remove (spec/tag-group.md, React Aria's grid of tags), as standalone attribute
// directives on the consumer's own elements. Its keys are the toolkit's `/collection`, its
// selection rules `/selection`.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { TagGroupLabel } from "./directives/tag-group-label.directive.ts";
export {
    TagGroupList,
    type TagGroupListState,
} from "./directives/tag-group-list.directive.ts";
export {
    TagGroupRemoveButton,
    type TagGroupRemoveButtonState,
} from "./directives/tag-group-remove-button.directive.ts";
export {
    TagGroupRoot,
    type TagGroupRootState,
    type TagGroupSelectionMode,
    type TagGroupTagEntry,
} from "./directives/tag-group-root.directive.ts";
export {
    TagGroupTag,
    type TagGroupTagState,
} from "./directives/tag-group-tag.directive.ts";
export { TagGroupTagCell } from "./directives/tag-group-tag-cell.directive.ts";
