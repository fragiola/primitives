// The entry of @fragiola/primitives-vue/field: the layer that labels, describes and validates a
// form control, with async validation and a Form's server errors (spec/field.md).

export type {
    FieldErrorMatch,
    FieldState,
    FieldValidate,
    FieldValidateResult,
    FieldValidationMode,
    FieldValidity,
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
