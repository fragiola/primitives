import type {
    FieldValidationMode,
    FormErrors,
} from "@fragiola/primitives/form";
import { createContext } from "react";

/** A field registered with its Form (spec/form.md, "A submission"). */
export interface FormFieldEntry {
    /** The field's `name`, which keys its server errors. */
    readonly name: string | undefined;
    /** Validates the field as on a submission attempt; whether it is invalid now. */
    submitAttempt: () => boolean;
    /** The element the Form focuses when the field is the first invalid one. */
    focusTarget: () => HTMLElement | null;
}

/**
 * What an enclosing Form gives the fields inside it (spec/form.md). It lives with the field, so
 * Form is built on Field and never the other way round.
 */
export interface FormContextValue {
    validationMode: FieldValidationMode;
    errors: FormErrors;
    /** Drops a field's server errors (its value changed). */
    clearErrors: (name: string) => void;
    register: (field: FormFieldEntry) => () => void;
}

export const FormContext = createContext<FormContextValue | null>(null);
