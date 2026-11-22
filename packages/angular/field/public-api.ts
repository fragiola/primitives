// The entry of @fragiola/primitives-angular/field: the layer that labels, describes and validates a
// form control (spec/field.md), as standalone attribute directives on the consumer's own elements.
// `injectField`, the control binding (`fieldControl`, `writeFieldAria`) and the Fieldset's and
// Form's contexts are the lower layer the other form controls, `/fieldset` and `/form` build on.

export type {
    FieldErrorMatch,
    FieldState,
    FieldValidate,
    FieldValidateResult,
    FieldValidationMode,
    FieldValidity,
    FormErrors,
    ValidityKey,
} from "@fragiola/primitives/form";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { FieldControl } from "./directives/field-control.directive.ts";
export { FieldDescription } from "./directives/field-description.directive.ts";
export {
    FieldError,
    type FieldErrorContext,
} from "./directives/field-error.directive.ts";
export { FieldLabel } from "./directives/field-label.directive.ts";
export {
    type FieldControlEntry,
    type FieldControlEvents,
    FieldRoot,
} from "./directives/field-root.directive.ts";
export { injectField } from "./inject/inject-field.ts";
export {
    type FieldControlBinding,
    type FieldControlData,
    type FieldControlOptions,
    fieldControl,
    writeFieldAria,
} from "./utils/field-control.ts";
export {
    FIELDSET_CONTEXT,
    type FieldsetContext,
} from "./utils/fieldset-context.ts";
export {
    FORM_CONTEXT,
    type FormContext,
    type FormField,
} from "./utils/form-context.ts";
