// The entry of @fragiola/primitives-vue/number-field: a number's text field, its buttons and its
// scrub area (spec/number-field.md, the APG spinbutton). Its parsing, formatting, stepping, auto
// repeat and scrub are the toolkit's `/number`; it is a Field control.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { NumberFieldState } from "./number-field-context.ts";
export type {
    NumberFieldRootEmits,
    NumberFieldRootProps,
} from "./number-field-root.ts";
export type { NumberFieldScrubAreaProps } from "./number-field-scrub-area.ts";
export { NumberField } from "./parts.ts";
