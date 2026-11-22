// The entry of @fragiola/primitives-vue/field: the layer that labels, describes and validates a
// form control (spec/field.md; the POC's Field, ported as it is).

export type {
    FieldErrorMatch,
    FieldState,
    FieldValidate,
    FieldValidationMode,
} from "@fragiola/primitives/form";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    FieldControlEmits,
    FieldControlProps,
} from "./field-control.ts";
export type { FieldDescriptionProps } from "./field-description.ts";
export type { FieldErrorProps } from "./field-error.ts";
export type { FieldLabelProps } from "./field-label.ts";
export type { FieldRootProps } from "./field-root.ts";
export { Field } from "./parts.ts";
