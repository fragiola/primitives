// The entry of @fragiola/primitives-vue/tags-input: a text input that turns what is typed into
// tags, with form support (spec/tags-input.md). Its keys are the toolkit's `/collection`, the
// rules that add and edit a tag `/form`.

export type { TagRefusal } from "@fragiola/primitives/form";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { TagsInput } from "./parts.ts";
export type { TagsInputClearTriggerState } from "./tags-input-clear-trigger.ts";
export type { TagsInputControlState } from "./tags-input-control.ts";
export type { TagsInputInputState } from "./tags-input-input.ts";
export type {
    TagsInputInvalidDetails,
    TagsInputRootEmits,
    TagsInputRootProps,
    TagsInputRootSlots,
    TagsInputRootState,
    TagsInputSlotProps,
} from "./tags-input-root.ts";
export type {
    TagsInputTagProps,
    TagsInputTagState,
} from "./tags-input-tag.ts";
export type { TagsInputTagInputState } from "./tags-input-tag-input.ts";
export type { TagsInputTagRemoveState } from "./tags-input-tag-remove.ts";
export type { TagsInputTagTextState } from "./tags-input-tag-text.ts";
