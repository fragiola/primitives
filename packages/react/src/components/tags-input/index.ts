// The entry of @fragiola/primitives-react/tags-input: a text input that turns what is typed into
// tags, with form support (spec/tags-input.md). Its keys are the toolkit's `/collection`, the
// rules that add and edit a tag `/form`.

export type { TagRefusal } from "@fragiola/primitives/form";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export { TagsInput } from "./parts.ts";
export type { TagsInputClearTriggerState } from "./tags-input-clear-trigger.tsx";
export type { TagsInputControlState } from "./tags-input-control.tsx";
export type { TagsInputInputState } from "./tags-input-input.tsx";
export type {
    TagsInputInvalidDetails,
    TagsInputRootProps,
    TagsInputRootState,
} from "./tags-input-root.tsx";
export type {
    TagsInputTagProps,
    TagsInputTagState,
} from "./tags-input-tag.tsx";
export type { TagsInputTagInputState } from "./tags-input-tag-input.tsx";
export type { TagsInputTagRemoveState } from "./tags-input-tag-remove.tsx";
