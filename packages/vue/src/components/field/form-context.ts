import type {
    FieldValidationMode,
    FormErrors,
} from "@fragiola/primitives/form";
import type { InjectionKey, ShallowRef } from "vue";

/** A field, as the enclosing Form sees it (spec/form.md, "A submission"). */
export interface FormField {
    name: () => string | undefined;
    /** Validates as on a submission attempt; whether the field is invalid now. */
    submitAttempt: () => boolean;
    /** The element the Form focuses when it is the first invalid field. */
    focusTarget: () => HTMLElement | null;
}

/**
 * What a Form gives the fields inside it (spec/form.md). It lives with the Field, which reads it:
 * Form is built on Field, never the other way round.
 */
export interface FormContext {
    validationMode: () => FieldValidationMode;
    /** The Form's copy of its server errors. */
    errors: ShallowRef<FormErrors>;
    /** Drops a field's errors (its value changed). */
    clearErrors: (name: string) => void;
    register: (field: FormField) => () => void;
}

export const FormKey: InjectionKey<FormContext> = Symbol("Form");
