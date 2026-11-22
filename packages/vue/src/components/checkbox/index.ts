// The entry of @fragiola/primitives-vue/checkbox: a two-state or mixed choice, with form support
// (spec/checkbox.md, the APG's checkbox).

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { CheckboxState } from "./checkbox-context.ts";
export type { CheckboxIndicatorProps } from "./checkbox-indicator.ts";
export type {
    CheckboxRootEmits,
    CheckboxRootProps,
} from "./checkbox-root.ts";
export { Checkbox } from "./parts.ts";
