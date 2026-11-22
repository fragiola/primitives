import {
    fieldStateAttributes,
    onSubmitAttempt,
} from "@fragiola/primitives/form";
import {
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react";
import { FieldContext } from "../components/field/field-context.ts";
import { stateAttributes } from "../utils/state-attributes.ts";

export interface UseFieldControlOptions {
    /** The control's labelable element's id (or its main element's). */
    id: string | undefined;
    /** Whether `<label for>` can point at it (a native input or a `button`). */
    labelable: boolean;
    /** A press on the label only focuses it, instead of clicking it (a trigger that opens a popup). */
    labelFocuses?: boolean;
    /** The control's value, given to `validate`. */
    value: unknown;
    filled: boolean;
    /** The element the form validates (the input, or the hidden input; `null` for none). */
    input: () => HTMLInputElement | null;
    /** The element a Form focuses when the field is the first invalid one (spec/field.md). */
    focusTarget: () => HTMLElement | null;
    /**
     * The control is not the field's own (a Checkbox inside a CheckboxGroup that is): it reads
     * nothing of the field and reports nothing.
     */
    skip?: boolean;
}

export interface FieldControlBinding {
    /** Inside a `Field.Root`. */
    inField: boolean;
    name: string | undefined;
    disabled: boolean;
    /** `aria-labelledby`, `aria-describedby`, `aria-invalid`, for the labelled element. */
    aria: Record<string, string | undefined>;
    /** The field's state attributes, for the control's main element. */
    attributes: Record<`data-${string}`, string>;
    onFocus: () => void;
    onBlur: () => void;
}

const OUTSIDE: FieldControlBinding = {
    inField: false,
    name: undefined,
    disabled: false,
    aria: {},
    attributes: {},
    onFocus: () => {},
    onBlur: () => {},
};

function serialize(value: unknown): string {
    return JSON.stringify(value) ?? "undefined";
}

/**
 * A control's side of the integration contract (spec/field.md): registers its id and its focus
 * target, reports its value, focus and blur, and the native form's submission attempts, and
 * returns what it renders. Outside a `Field.Root`, it does nothing and returns nothing.
 */
export function useFieldControl(
    options: UseFieldControlOptions,
): FieldControlBinding {
    const context = useContext(FieldContext);
    const field = options.skip ? null : context;
    const latest = useRef(options);
    latest.current = options;
    const initial = useRef<string | null>(null);
    const previous = useRef<string | null>(null);

    const { id, labelable, labelFocuses = false } = options;
    const registerControl = field?.registerControl;
    useLayoutEffect(
        () =>
            registerControl === undefined || id === undefined
                ? undefined
                : registerControl({ id, labelable, labelFocuses }),
        [registerControl, id, labelable, labelFocuses],
    );
    const attach = field?.attach;
    useLayoutEffect(
        () =>
            attach?.({
                input: () => latest.current.input(),
                value: () => latest.current.value,
                focusTarget: () => latest.current.focusTarget(),
            }),
        [attach],
    );

    const events = field?.events;
    const serialized = serialize(options.value);
    useEffect(() => {
        if (events === undefined) {
            return;
        }
        const { input, value, filled } = latest.current;
        if (initial.current === null) {
            initial.current = serialized;
            previous.current = serialized;
            events.mounted(input(), value, filled);
            return;
        }
        if (previous.current === serialized) {
            return;
        }
        previous.current = serialized;
        events.changed(input(), value, serialized !== initial.current, filled);
    }, [events, serialized]);

    // inside a Form, the Form runs the submission attempts (spec/form.md)
    const inForm = field?.inForm ?? false;
    useEffect(() => {
        if (events === undefined || inForm) {
            return undefined;
        }
        const { input, focusTarget } = latest.current;
        const form = input()?.form ?? focusTarget()?.closest("form") ?? null;
        if (form === null) {
            return undefined;
        }
        return onSubmitAttempt(form, () => {
            const { input: current, value } = latest.current;
            events.submitAttempt(current(), value);
        });
    }, [events, inForm]);

    const onBlur = useCallback(() => {
        const { input, value } = latest.current;
        events?.blurred(input(), value);
    }, [events]);
    // stable while the field's context is: the controls put it in their own memoized context
    return useMemo(() => {
        if (field === null || events === undefined) {
            return OUTSIDE;
        }
        return {
            inField: true,
            name: field.name,
            disabled: field.disabled,
            aria: {
                // a control named by its own content too (a picker's Trigger) adds itself, so its
                // visible text stays in its name (WCAG 2.5.3, spec/field.md)
                "aria-labelledby":
                    labelFocuses &&
                    field.labelId !== undefined &&
                    id !== undefined
                        ? `${field.labelId} ${id}`
                        : field.labelId,
                "aria-describedby": field.describedBy,
                "aria-invalid": field.invalid ? "true" : undefined,
            },
            attributes: stateAttributes(fieldStateAttributes(field.state)),
            onFocus: events.focused,
            onBlur,
        };
    }, [field, events, onBlur, labelFocuses, id]);
}
