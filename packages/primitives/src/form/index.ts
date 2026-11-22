// The entry of @fragiola/primitives/form: the form bridge, the field's validity (with async
// validation), state and change rules, the submit attempt, the Form's errors and submission
// guard, the visually hidden input.

export {
    type FieldValidationMode,
    shownAfterChange,
    validatesOnChange,
} from "./field-change.ts";
export { fieldDescribedBy } from "./field-described-by.ts";
export {
    type FieldErrorMatch,
    fieldErrorMessages,
    fieldErrorShown,
} from "./field-error-shown.ts";
export { type FieldState, fieldStateAttributes } from "./field-state.ts";
export {
    CLEARED,
    createFieldValidator,
    type FieldValidate,
    type FieldValidateResult,
    type FieldValidation,
    type FieldValidator,
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
export {
    type FormErrors,
    formErrorsFor,
    withoutFormErrors,
} from "./form-errors.ts";
export {
    firstInDocumentOrder,
    focusFieldControl,
    guardFormSubmit,
} from "./form-submit.ts";
export { onSubmitAttempt } from "./submit-attempt.ts";
export { VISUALLY_HIDDEN_INPUT_STYLE } from "./visually-hidden.ts";
