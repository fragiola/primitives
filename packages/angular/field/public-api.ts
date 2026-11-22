// The entry of @fragiola/primitives-angular/field: the layer that labels, describes and validates a
// form control (spec/field.md; the POC's Field, ported as it is), as standalone attribute
// directives on the consumer's own elements. `injectField` and the control binding
// (`fieldControl`, `writeFieldAria`) are the lower layer the other form controls integrate with.

export type {
    FieldErrorMatch,
    FieldState,
    FieldValidate,
    FieldValidationMode,
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
