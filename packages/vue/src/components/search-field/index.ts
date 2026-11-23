// The entry of @fragiola/primitives-vue/search-field: a search query's field, cleared by Escape and
// a ClearButton (spec/search-field.md, React Aria's). Its Input is the form control; it is a Field
// control.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { SearchField } from "./parts.ts";
export type { SearchFieldState } from "./search-field-context.ts";
export type {
    SearchFieldRootEmits,
    SearchFieldRootProps,
} from "./search-field-root.ts";
