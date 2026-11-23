// The entry of @fragiola/primitives-react/search-field: a search query's field, cleared by Escape
// and a ClearButton (spec/search-field.md, React Aria's). Its Input is the form control; it is a
// Field control.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export { SearchField } from "./parts.ts";
export type { SearchFieldClearButtonProps } from "./search-field-clear-button.tsx";
export type { SearchFieldState } from "./search-field-context.ts";
export type { SearchFieldInputProps } from "./search-field-input.tsx";
export type { SearchFieldRootProps } from "./search-field-root.tsx";
