// The entry of @fragiola/primitives-react/field: the layer that labels, describes and validates a
// form control (spec/field.md).

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
export type { RenderProp } from "../../utils/render-element.tsx";
export type { FieldControlProps } from "./field-control.tsx";
export type { FieldDescriptionProps } from "./field-description.tsx";
export type { FieldErrorProps } from "./field-error.tsx";
export type { FieldLabelProps } from "./field-label.tsx";
export type { FieldRootProps } from "./field-root.tsx";
export { Field } from "./parts.ts";
