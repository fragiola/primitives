// The entry of @fragiola/primitives-react/number-field: a number's text field, its buttons and its
// scrub area (spec/number-field.md, the APG spinbutton). Its parsing, formatting, stepping, auto
// repeat and scrub are the toolkit's `/number`; it is a Field control.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { NumberFieldState } from "./number-field-context.ts";
export type { NumberFieldDecrementProps } from "./number-field-decrement.tsx";
export type { NumberFieldGroupProps } from "./number-field-group.tsx";
export type { NumberFieldIncrementProps } from "./number-field-increment.tsx";
export type { NumberFieldInputProps } from "./number-field-input.tsx";
export type { NumberFieldRootProps } from "./number-field-root.tsx";
export type { NumberFieldScrubAreaProps } from "./number-field-scrub-area.tsx";
export type { NumberFieldScrubAreaCursorProps } from "./number-field-scrub-area-cursor.tsx";
export { NumberField } from "./parts.ts";
