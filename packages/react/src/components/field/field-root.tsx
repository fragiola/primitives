import {
    createFieldValidator,
    type FieldState,
    type FieldValidate,
    type FieldValidation,
    type FieldValidationMode,
    fieldDescribedBy,
    fieldStateAttributes,
    formErrorsFor,
    shownAfterChange,
    UNVALIDATED,
    validatesOnChange,
} from "@fragiola/primitives/form";
import {
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    FieldContext,
    type FieldControlEvents,
    type FieldControlHandle,
    type FieldControlInfo,
} from "./field-context.ts";
import { FieldsetContext } from "./fieldset-context.ts";
import { FormContext, type FormFieldEntry } from "./form-context.ts";

export interface FieldRootProps extends PartProps<FieldState> {
    /** The control's form name; it wins over the control's own, and keys the Form's errors. */
    name?: string;
    disabled?: boolean;
    /** Forces the invalid state (an error the app found). */
    invalid?: boolean;
    /** A message, a list, or none; or a promise of one of these (spec/field.md, "Async validation"). */
    validate?: FieldValidate;
    /** Default: the enclosing Form's, else `"onSubmit"`. */
    validationMode?: FieldValidationMode;
}

const NO_ERRORS: readonly string[] = [];

/** Holds the field's state, validation and ids (spec/field.md). */
export function FieldRoot({
    name,
    disabled: disabledProp = false,
    invalid: invalidProp = false,
    validate,
    validationMode: validationModeProp,
    ...props
}: FieldRootProps) {
    const fieldset = useContext(FieldsetContext);
    const form = useContext(FormContext);
    const disabled = disabledProp || (fieldset?.disabled ?? false);
    const validationMode =
        validationModeProp ?? form?.validationMode ?? "onSubmit";
    const formErrorsSource = form?.errors;
    const formErrors = useMemo(
        () =>
            formErrorsSource === undefined
                ? NO_ERRORS
                : formErrorsFor(formErrorsSource, name),
        [formErrorsSource, name],
    );
    const [touched, setTouched] = useState(false);
    const [focused, setFocused] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [filled, setFilled] = useState(false);
    const [shown, setShown] = useState<FieldValidation>(UNVALIDATED);
    const [labelId, setLabelId] = useState<string>();
    const [control, setControl] = useState<FieldControlInfo | null>(null);
    const [messages, setMessages] = useState<readonly HTMLElement[]>([]);
    // whether the value changed once, or a submission was attempted (the required rule)
    const changed = useRef(false);
    const submitted = useRef(false);
    const handle = useRef<FieldControlHandle | null>(null);
    const [validator] = useState(createFieldValidator);
    useEffect(() => () => validator.cancel(), [validator]);
    const latest = useRef({
        name,
        validate,
        validationMode,
        disabled,
        invalid: invalidProp,
        formErrors,
        form,
    });
    latest.current = {
        name,
        validate,
        validationMode,
        disabled,
        invalid: invalidProp,
        formErrors,
        form,
    };

    const { events, attempt } = useMemo(() => {
        // a run's result now, or `null` while an async `validate` is pending: `settle` then
        // applies it as the event that started the run would have
        const run = (
            input: HTMLInputElement | null,
            value: unknown,
            always: boolean,
            settle: (validation: FieldValidation) => void,
        ) =>
            validator.run(
                input,
                {
                    value,
                    validate: latest.current.validate,
                    valueChanged: changed.current,
                    always,
                },
                settle,
            );
        const show = (validation: FieldValidation) => setShown(validation);
        const submitAttempt = (
            input: HTMLInputElement | null,
            value: unknown,
        ) => {
            submitted.current = true;
            changed.current = true;
            const result = run(
                input,
                value,
                validatesOnChange(latest.current.validationMode, true),
                show,
            );
            if (result !== null) {
                setShown(result);
            }
            const current = latest.current;
            // a pending run counts as not invalid: the submission does not wait for it
            return (
                !current.disabled &&
                (current.invalid ||
                    current.formErrors.length > 0 ||
                    result?.validity.valid === false)
            );
        };
        const controlEvents: FieldControlEvents = {
            mounted: (input, value, isFilled) => {
                setFilled(isFilled);
                run(input, value, false, () => {});
            },
            changed: (input, value, isDirty, isFilled) => {
                changed.current = true;
                setDirty(isDirty);
                setFilled(isFilled);
                const current = latest.current;
                // the first change drops the field's server errors
                if (
                    current.form !== null &&
                    current.name !== undefined &&
                    current.formErrors.length > 0
                ) {
                    current.form.clearErrors(current.name);
                }
                const onChange = validatesOnChange(
                    current.validationMode,
                    submitted.current,
                );
                const apply = (next: FieldValidation | null) =>
                    setShown((before) =>
                        shownAfterChange(before, next, onChange),
                    );
                // a pending run (`null`) still hides a shown error at once when the field does
                // not validate on change (spec/field.md, "Async validation")
                apply(run(input, value, onChange, apply));
            },
            focused: () => setFocused(true),
            blurred: (input, value) => {
                setFocused(false);
                setTouched(true);
                if (latest.current.validationMode === "onBlur") {
                    const next = run(input, value, false, show);
                    if (next !== null) {
                        setShown(next);
                    }
                }
            },
            submitAttempt,
        };
        // the Form's submission: the control's live input and value
        const formAttempt = () => {
            const current = handle.current;
            return submitAttempt(
                current?.input() ?? null,
                current?.value() ?? null,
            );
        };
        return { events: controlEvents, attempt: formAttempt };
    }, [validator]);

    const registerControl = useCallback((info: FieldControlInfo) => {
        setControl(info);
        return () => setControl(null);
    }, []);
    const attach = useCallback((next: FieldControlHandle) => {
        handle.current = next;
        return () => {
            if (handle.current === next) {
                handle.current = null;
            }
        };
    }, []);
    const registerMessage = useCallback((element: HTMLElement) => {
        setMessages((list) => [...list, element]);
        return () =>
            setMessages((list) => list.filter((entry) => entry !== element));
    }, []);

    // the Form validates the field on its submission, and focuses it when it is the first invalid
    const register = form?.register;
    useLayoutEffect(() => {
        if (register === undefined) {
            return undefined;
        }
        const entry: FormFieldEntry = {
            get name() {
                return latest.current.name;
            },
            submitAttempt: attempt,
            focusTarget: () => handle.current?.focusTarget() ?? null,
        };
        return register(entry);
    }, [register, attempt]);

    const valid = disabled
        ? null
        : invalidProp || formErrors.length > 0
          ? false
          : shown.validity.valid;
    const state: FieldState = {
        valid,
        dirty,
        touched,
        filled,
        focused,
        disabled,
    };
    const describedBy = useMemo(() => fieldDescribedBy(messages), [messages]);
    const inForm = form !== null;
    const context = useMemo(
        () => ({
            state: { valid, dirty, touched, filled, focused, disabled },
            invalid: valid === false,
            name,
            disabled,
            shown,
            formErrors,
            inForm,
            labelId,
            setLabelId,
            control,
            registerControl,
            attach,
            describedBy,
            registerMessage,
            events,
        }),
        [
            valid,
            dirty,
            touched,
            filled,
            focused,
            disabled,
            name,
            shown,
            formErrors,
            inForm,
            labelId,
            control,
            registerControl,
            attach,
            describedBy,
            registerMessage,
            events,
        ],
    );
    return (
        <FieldContext.Provider value={context}>
            {renderElement("div", props, state, {
                "data-primitives-part": "field-root",
                ...stateAttributes(fieldStateAttributes(state)),
            })}
        </FieldContext.Provider>
    );
}
