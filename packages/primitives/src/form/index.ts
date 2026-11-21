// The entry of @fragiola/primitives/form: the form bridge, the field's validity, state and change rules, the submit attempt, the visually hidden input.

export {
    type FieldValidationMode,
    shownAfterChange,
    validatesOnChange,
} from "./field-change.ts";
export { fieldDescribedBy } from "./field-described-by.ts";
export {
    type FieldErrorMatch,
    fieldErrorShown,
} from "./field-error-shown.ts";
export { type FieldState, fieldStateAttributes } from "./field-state.ts";
export {
    CLEARED,
    type FieldValidate,
    type FieldValidation,
    type FieldValidity,
    UNVALIDATED,
    VALIDITY_KEYS,
    type ValidateFieldOptions,
    type ValidityKey,
    validateField,
} from "./field-validity.ts";
export {
    bridgeForm,
    type FormBridgeOptions,
} from "./form-bridge.ts";
export { onSubmitAttempt } from "./submit-attempt.ts";
export { VISUALLY_HIDDEN_INPUT_STYLE } from "./visually-hidden.ts";
