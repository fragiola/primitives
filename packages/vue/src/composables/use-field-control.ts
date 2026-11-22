import {
    fieldStateAttributes,
    onSubmitAttempt,
} from "@fragiola/primitives/form";
import { inject, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { FieldKey } from "../components/field/field-context.ts";
import { stateAttributes } from "../utils/state-attributes.ts";

export interface UseFieldControlOptions {
    /** The control's labelable element's id (or its main element's). */
    id: () => string | undefined;
    /** Whether `<label for>` can point at it (a native input or a `button`). */
    labelable: boolean;
    /** A press on the Label focuses it instead of clicking it (default `false`). */
    labelFocuses?: boolean;
    /** The control's value, given to `validate`. */
    value: () => unknown;
    filled: () => boolean;
    /** The element the form validates (the input, or the hidden input; `null` for none). */
    input: () => HTMLInputElement | null;
    /** The element a Form focuses when the field is the first invalid one (spec/field.md, 5). */
    focusTarget: () => HTMLElement | null;
    /**
     * The control's own element, for one with no validated element (a CheckboxGroup): where its
     * native form is found (default: the focus target).
     */
    element?: () => HTMLElement | null;
}

/** What a control renders inside a field; each getter is read at render time. */
export interface FieldControlBinding {
    /** Inside a `Field.Root`. */
    inField: boolean;
    name: () => string | undefined;
    disabled: () => boolean;
    /** `aria-labelledby`, `aria-describedby`, `aria-invalid`, for the labelled element. */
    aria: () => Record<string, string | undefined>;
    /** The field's state attributes, for the control's main element. */
    attributes: () => Record<string, string>;
    onFocus: () => void;
    onBlur: () => void;
    /**
     * Called by the control's form reset, before it returns to its default: the value it reports
     * next is no change (spec/form.md, "A form reset does not clear the Form's errors nor the
     * fields' states"), only its filled state and custom validity follow it.
     */
    reset: () => void;
}

/** Outside a field: nothing of a field's. */
export const OUTSIDE_FIELD: FieldControlBinding = {
    inField: false,
    name: () => undefined,
    disabled: () => false,
    aria: () => ({}),
    attributes: () => ({}),
    onFocus: () => {},
    onBlur: () => {},
    reset: () => {},
};

function serialize(value: unknown): string {
    return JSON.stringify(value) ?? "undefined";
}

/**
 * A control's side of the integration contract (spec/field.md): registers its id, reports its
 * value, focus and blur, and the form's submission attempts, and returns what it renders. Outside
 * a `Field.Root`, it does nothing and returns nothing.
 */
export function useFieldControl(
    options: UseFieldControlOptions,
): FieldControlBinding {
    const field = inject(FieldKey, null);
    if (field === null) {
        return OUTSIDE_FIELD;
    }
    const { events } = field;

    // unregistered on unmount (or when the id changes), not in the watch's cleanup: a server
    // render stops the watch once the control is rendered, before a later label reads it
    let unregister: (() => void) | null = null;
    watch(
        options.id,
        (id) => {
            unregister?.();
            unregister =
                id === undefined
                    ? null
                    : field.registerControl({
                          id,
                          labelable: options.labelable,
                          labelFocuses: options.labelFocuses ?? false,
                      });
        },
        { immediate: true },
    );
    onBeforeUnmount(() => {
        unregister?.();
        unregister = null;
    });
    const detach = field.attachControl({
        input: options.input,
        value: options.value,
        focusTarget: options.focusTarget,
    });
    onBeforeUnmount(detach);

    let stop: (() => void)[] = [];
    // a form reset is pending: the next flush reports the value as on mount (the counter flushes
    // even when the value already is the default, so the mark never outlives the reset)
    let resetting = false;
    const resets = ref(0);
    // from the mount on: the control's own state may be defined after this call
    onMounted(() => {
        const initial = serialize(options.value());
        let previous = initial;
        events.mounted(options.input(), options.value(), options.filled());
        // inside a Form, the Form's submission validates the field (spec/form.md); outside one,
        // the native form is found once the control's elements render (a picker's trigger), and
        // listened to until unmount
        if (!field.inForm) {
            const findForm = () =>
                options.input()?.form ??
                (options.element?.() ?? options.focusTarget())?.closest(
                    "form",
                ) ??
                null;
            const listen = (form: HTMLFormElement) =>
                stop.push(
                    onSubmitAttempt(form, () => {
                        events.submitAttempt(options.input(), options.value());
                    }),
                );
            const form = findForm();
            if (form !== null) {
                listen(form);
            } else {
                const unwatch = watch(
                    findForm,
                    (found) => {
                        if (found !== null) {
                            unwatch();
                            listen(found);
                        }
                    },
                    { flush: "post" },
                );
                stop.push(unwatch);
            }
        }
        // after the render: the validated element holds the new value
        stop.push(
            watch(
                [() => serialize(options.value()), resets],
                ([serialized]) => {
                    const isReset = resetting;
                    resetting = false;
                    if (previous === serialized) {
                        return;
                    }
                    previous = serialized;
                    if (isReset) {
                        // a reset changes no field state: no `dirty`, no cleared server errors
                        events.mounted(
                            options.input(),
                            options.value(),
                            options.filled(),
                        );
                        return;
                    }
                    events.changed(
                        options.input(),
                        options.value(),
                        serialized !== initial,
                        options.filled(),
                    );
                },
                { flush: "post" },
            ),
        );
    });
    onBeforeUnmount(() => {
        for (const cleanup of stop) {
            cleanup();
        }
        stop = [];
    });

    return {
        inField: true,
        name: field.name,
        disabled: field.disabled,
        aria: () => ({
            // a control named by its own content too (a picker's Trigger) adds itself, so its
            // visible text stays in its name (WCAG 2.5.3, spec/field.md)
            "aria-labelledby":
                options.labelFocuses &&
                field.labelId.value !== undefined &&
                options.id() !== undefined
                    ? `${field.labelId.value} ${options.id()}`
                    : field.labelId.value,
            "aria-describedby": field.describedBy.value,
            "aria-invalid": field.invalid.value ? "true" : undefined,
        }),
        attributes: () =>
            stateAttributes(fieldStateAttributes(field.state.value)),
        onFocus: events.focused,
        onBlur: () => events.blurred(options.input(), options.value()),
        reset: () => {
            resetting = true;
            resets.value += 1;
        },
    };
}
