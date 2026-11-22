import {
    fieldStateAttributes,
    onSubmitAttempt,
} from "@fragiola/primitives/form";
import { inject, onBeforeUnmount, onMounted, watch } from "vue";
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
    // from the mount on: the control's own state may be defined after this call
    onMounted(() => {
        const initial = serialize(options.value());
        let previous = initial;
        events.mounted(options.input(), options.value(), options.filled());
        // inside a Form, the Form's submission validates the field (spec/form.md)
        const form = field.inForm ? null : options.input()?.form;
        if (form !== null && form !== undefined) {
            stop.push(
                onSubmitAttempt(form, () => {
                    events.submitAttempt(options.input(), options.value());
                }),
            );
        }
        // after the render: the validated element holds the new value
        stop.push(
            watch(
                () => serialize(options.value()),
                (serialized) => {
                    if (previous === serialized) {
                        return;
                    }
                    previous = serialized;
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
    };
}
