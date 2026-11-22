import { InjectionToken, type Signal } from "@angular/core";
import type {
    FieldValidationMode,
    FormErrors,
} from "@fragiola/primitives/form";

/** A field registered with its Form (spec/form.md, "A submission"). */
export interface FormField {
    /** The field's `name`, which keys the Form's errors. */
    name: () => string | undefined;
    /**
     * Validates the field as on a submission attempt (its errors are shown) and returns whether it
     * is invalid now: its validity is `false`, `invalid` is set, or the Form has errors for it. A
     * pending async run counts as not invalid.
     */
    submitAttempt: () => boolean;
    /** Whether the field is invalid now, without validating it. */
    invalid: () => boolean;
    /** The element the Form focuses when the field is the first invalid one. */
    focusTarget: () => HTMLElement | null;
}

/**
 * What an enclosing `form[formRoot]` gives the fields inside it (spec/form.md): the default
 * `validationMode`, its server errors, clearing a field's errors, and the registration its
 * submission validates. It lives in the field's entry, the lower layer the Form is built on.
 */
export interface FormContext {
    validationMode: Signal<FieldValidationMode>;
    errors: Signal<FormErrors>;
    /** Drops a field's errors (its value changed). */
    clearErrors: (name: string) => void;
    /** A field registers for the Form's submissions; returns the cleanup. */
    register: (field: FormField) => () => void;
}

export const FORM_CONTEXT = new InjectionToken<FormContext>("FORM_CONTEXT");
