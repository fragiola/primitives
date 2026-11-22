import {
    type FieldValidationMode,
    type FormErrors,
    firstInDocumentOrder,
    focusFieldControl,
    formErrorsFor,
    guardFormSubmit,
    withoutFormErrors,
} from "@fragiola/primitives/form";
import {
    type FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useElement } from "../../hooks/use-element.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { FormContext, type FormFieldEntry } from "../field/form-context.ts";

/** The Form has no state of its own: its fields carry theirs. */
export type FormState = Record<string, never>;

export interface FormProps extends PartProps<FormState> {
    /** Server errors, keyed by the fields' `name`. A new object replaces the Form's copy. */
    errors?: FormErrors;
    /**
     * A field's value changed while the Form had errors for it: the errors left (its key removed).
     * A method, so a handler typed with a narrower record of errors is accepted.
     */
    onClearErrors?(errors: FormErrors): void;
    /** The default of every Field inside it (default `"onSubmit"`); a Field's own wins. */
    validationMode?: FieldValidationMode;
    /** The native `submit` event: only for a submission that goes on (no field is invalid). */
    onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

const NO_ERRORS: FormErrors = {};
const STATE: FormState = {};

/**
 * A native `form` that validates its fields itself (spec/form.md): a submission validates every
 * field, and is blocked (before any listener of the consumer's) and focuses the first invalid one
 * while one is; server errors show on the fields they name.
 */
export function Form({
    errors: errorsProp,
    onClearErrors,
    validationMode = "onSubmit",
    ...props
}: FormProps) {
    // the Form's own copy of `errors`, replaced when the prop changes
    const [given, setGiven] = useState(errorsProp);
    const [errors, setErrors] = useState<FormErrors>(errorsProp ?? NO_ERRORS);
    if (given !== errorsProp) {
        setGiven(errorsProp);
        setErrors(errorsProp ?? NO_ERRORS);
    }
    const fields = useRef(new Set<FormFieldEntry>());
    // a submission went on: the next errors (the server's answer) focus the first invalid field
    const submission = useRef(false);
    const latest = useRef({ errors, onClearErrors });
    latest.current = { errors, onClearErrors };

    const clearErrors = useCallback((name: string) => {
        const { errors: current, onClearErrors: report } = latest.current;
        const next = withoutFormErrors(current, name);
        if (next === current) {
            return;
        }
        latest.current.errors = next;
        setErrors(next);
        report?.(next);
    }, []);
    const register = useCallback((field: FormFieldEntry) => {
        fields.current.add(field);
        return () => {
            fields.current.delete(field);
        };
    }, []);

    const [element, ref] = useElement<HTMLFormElement>();
    useEffect(() => {
        if (element === null) {
            return undefined;
        }
        return guardFormSubmit(element, () => {
            // every field validates (no short circuit), then the first invalid one takes focus
            const invalid = [...fields.current].filter((field) =>
                field.submitAttempt(),
            );
            if (invalid.length > 0) {
                const target = firstInDocumentOrder(
                    invalid.map((field) => field.focusTarget()),
                );
                if (target !== null) {
                    focusFieldControl(target);
                }
                return false;
            }
            submission.current = true;
            return true;
        });
    }, [element]);

    // the server's answer after a submission went on, once the fields show it
    useEffect(() => {
        if (!submission.current) {
            return;
        }
        submission.current = false;
        const target = firstInDocumentOrder(
            [...fields.current]
                .filter((field) => formErrorsFor(errors, field.name).length > 0)
                .map((field) => field.focusTarget()),
        );
        if (target !== null) {
            focusFieldControl(target);
        }
    }, [errors]);

    const context = useMemo(
        () => ({ validationMode, errors, clearErrors, register }),
        [validationMode, errors, clearErrors, register],
    );
    return (
        <FormContext.Provider value={context}>
            {renderElement(
                "form",
                props,
                STATE,
                {
                    noValidate: true,
                    "data-primitives-part": "form-root",
                },
                ref as (element: HTMLElement | null) => void,
            )}
        </FormContext.Provider>
    );
}
