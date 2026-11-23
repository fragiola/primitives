// The entry of @fragiola/primitives-angular/tags-input: a text input that turns what is typed into
// tags, with form support (spec/tags-input.md), as standalone attribute directives on the
// consumer's own elements. Its keys are the toolkit's `/collection`, the rules that add and edit a
// tag `/form`.

export type { TagRefusal } from "@fragiola/primitives/form";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export {
    TagsInputClearTrigger,
    type TagsInputClearTriggerState,
} from "./directives/tags-input-clear-trigger.directive.ts";
export {
    TagsInputControl,
    type TagsInputControlState,
} from "./directives/tags-input-control.directive.ts";
export {
    TagsInputInput,
    type TagsInputInputState,
} from "./directives/tags-input-input.directive.ts";
export {
    type TagsInputEdit,
    type TagsInputInvalidDetails,
    type TagsInputInvalidEvent,
    TagsInputRoot,
    type TagsInputRootState,
} from "./directives/tags-input-root.directive.ts";
export {
    TagsInputTag,
    type TagsInputTagState,
} from "./directives/tags-input-tag.directive.ts";
export {
    TagsInputTagInput,
    type TagsInputTagInputState,
} from "./directives/tags-input-tag-input.directive.ts";
export {
    TagsInputTagRemove,
    type TagsInputTagRemoveState,
} from "./directives/tags-input-tag-remove.directive.ts";
export { TagsInputTagText } from "./directives/tags-input-tag-text.directive.ts";
