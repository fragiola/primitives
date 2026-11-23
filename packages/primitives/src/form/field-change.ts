import { CLEARED, type FieldValidation } from "./field-validity.ts";

/** A field's `validationMode` (spec/field.md). */
export type FieldValidationMode = "onSubmit" | "onBlur" | "onChange";

/**
 * Whether a field validates and shows the result on every change: in `onChange` mode, and in
 * `onSubmit` mode once a submission was attempted (spec/field.md, "When the result is shown").
 */
export function validatesOnChange(
    mode: FieldValidationMode,
    submitted: boolean,
): boolean {
    return mode === "onChange" || (mode === "onSubmit" && submitted);
}

/**
 * What a field shows after a change, from what it showed and the change's fresh validation (`null`
 * while its async `validate` is pending). A field that validates on change shows the fresh result,
 * or keeps what it showed while the run is pending. Otherwise a shown error is cleared at once,
 * pending run or not (Epic #49), unless the value is now missing (the required error shows at
 * once); anything else stays as it was.
 */
export function shownAfterChange(
    shown: FieldValidation,
    next: FieldValidation | null,
    onChange: boolean,
): FieldValidation {
    if (onChange) {
        return next ?? shown;
    }
    if (shown.validity.valid !== false) {
        return shown;
    }
    return next?.validity.valueMissing ? next : CLEARED;
}
