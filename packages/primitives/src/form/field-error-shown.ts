import type {
    FieldValidation,
    FieldValidity,
    ValidityKey,
} from "./field-validity.ts";

/**
 * `Field.Error`'s `match`: a `ValidityState` key, a function of the field's validity, or `true`
 * for always (spec/field.md).
 */
export type FieldErrorMatch =
    | ValidityKey
    | ((validity: FieldValidity) => boolean)
    | true;

/**
 * Whether a `Field.Error` is shown: always with `match={true}`; never in a disabled field;
 * with a key, while that key is set; with a function, while it returns `true`; without, while the
 * field is invalid (its validity is `false`, the app set `invalid`, or its Form has errors for it).
 */
export function fieldErrorShown(
    match: FieldErrorMatch | undefined,
    shown: FieldValidation,
    field: { invalid: boolean; disabled: boolean },
): boolean {
    if (match === true) {
        return true;
    }
    if (field.disabled) {
        return false;
    }
    if (typeof match === "function") {
        return match(shown.validity);
    }
    if (match !== undefined) {
        return shown.validity[match];
    }
    return field.invalid || shown.validity.valid === false;
}

/**
 * The messages a `Field.Error` with no children shows: the Form's errors for the field when it has
 * some (only for an Error with no key or function `match`), else the field's own messages.
 */
export function fieldErrorMessages(
    match: FieldErrorMatch | undefined,
    shown: FieldValidation,
    formErrors: readonly string[],
): readonly string[] {
    const general = match === undefined || match === true;
    return general && formErrors.length > 0 ? formErrors : shown.errors;
}
