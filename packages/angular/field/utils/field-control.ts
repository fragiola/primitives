import {
    afterRenderEffect,
    computed,
    DestroyRef,
    effect,
    inject,
    type Signal,
    signal,
    untracked,
} from "@angular/core";
import { onSubmitAttempt } from "@fragiola/primitives/form";
import { ownAttribute } from "@fragiola/primitives-angular/internal";
import { injectField } from "../inject/inject-field.ts";

export interface FieldControlOptions {
    /** The control's labelable element's id (or its main element's), once it has one. */
    id: Signal<string | undefined>;
    /** Whether `<label for>` can point at it (a native input or a `button`). */
    labelable: boolean;
    /**
     * A press on the field's label focuses the control instead of clicking it (a picker's Trigger:
     * the label's click would open its popup, which takes the focus; spec/field.md, `/field/more-controls`).
     */
    focusOnLabel?: boolean;
    /** The control's value, given to `validate`. */
    value: Signal<unknown>;
    filled: Signal<boolean>;
    /** The element the form validates (the input, or the hidden input; `null` for none). */
    input: () => HTMLInputElement | null;
    /**
     * The element a Form focuses when the field is the first invalid one (spec/field.md,
     * "Integration contract" item 5): its labelable element, a Slider's first Thumb, a group's
     * first enabled Checkbox.
     */
    focusTarget: () => HTMLElement | null;
    /**
     * The control's own element, for one with no validated element (a CheckboxGroup): where its
     * native form is found (default: the focus target).
     */
    element?: () => HTMLElement | null;
    /**
     * A control that is part of the field's control (a CheckboxGroup's Checkbox): it does not
     * register as the field's control, and gets nothing from the field.
     */
    part?: boolean;
}

/** The field's state attributes for a control's main element, `null` outside a field. */
export interface FieldControlData {
    invalid: string | null;
    valid: string | null;
    dirty: string | null;
    touched: string | null;
    filled: string | null;
    focused: string | null;
    disabled: string | null;
}

export interface FieldControlBinding {
    /** Inside a `[fieldRoot]`. */
    inField: boolean;
    name: Signal<string | undefined>;
    disabled: Signal<boolean>;
    /** `aria-labelledby`, `aria-describedby`, `aria-invalid`, for the labelled element. */
    labelledBy: Signal<string | null>;
    describedBy: Signal<string | null>;
    ariaInvalid: Signal<"true" | null>;
    data: Signal<FieldControlData>;
    focused: () => void;
    blurred: () => void;
    /**
     * Called by the control's form reset, before it returns to its default: the value it reports
     * next is no change (spec/form.md, "A form reset does not clear the Form's errors nor the
     * fields' states"), only its filled state and custom validity follow it.
     */
    reset: () => void;
}

const NONE = computed(() => null);
const OUTSIDE: FieldControlBinding = {
    inField: false,
    name: computed(() => undefined),
    disabled: computed(() => false),
    labelledBy: NONE,
    describedBy: NONE,
    ariaInvalid: NONE,
    data: computed(() => ({
        invalid: null,
        valid: null,
        dirty: null,
        touched: null,
        filled: null,
        focused: null,
        disabled: null,
    })),
    focused: () => {},
    blurred: () => {},
    reset: () => {},
};

function serialize(value: unknown): string {
    return JSON.stringify(value) ?? "undefined";
}

/**
 * A control's side of the integration contract (spec/field.md), in its directive's injection
 * context: registers its id, reports its value (after the render, so the validated element holds
 * it), its focus and blur, the form's submission attempts, its validated element and focus target
 * (for a `form[formRoot]`), and returns what it renders. Outside a `[fieldRoot]`, it does nothing
 * and returns nothing.
 */
export function fieldControl(
    options: FieldControlOptions,
): FieldControlBinding {
    const field = injectField();
    if (field === null || options.part === true) {
        return OUTSIDE;
    }
    const { events } = field;
    inject(DestroyRef).onDestroy(
        field.registerEntry({
            input: options.input,
            value: options.value,
            focusTarget: options.focusTarget,
        }),
    );

    effect((onCleanup) => {
        const id = options.id();
        if (id !== undefined && id !== "") {
            onCleanup(
                untracked(() =>
                    field.registerControl(
                        id,
                        options.labelable,
                        options.focusOnLabel,
                    ),
                ),
            );
        }
    });

    let initial: string | null = null;
    let previous: string | null = null;
    // a form reset is pending: the next render reports the value as on mount (the counter runs the
    // effect even when the value already is the default, so the mark never outlives the reset)
    let resetting = false;
    const resets = signal(0);
    afterRenderEffect(() => {
        const value = options.value();
        const filled = options.filled();
        resets();
        const serialized = serialize(value);
        untracked(() => {
            if (initial === null) {
                initial = serialized;
                previous = serialized;
                events.mounted(options.input(), value, filled);
                return;
            }
            const isReset = resetting;
            resetting = false;
            if (previous === serialized) {
                return;
            }
            previous = serialized;
            if (isReset) {
                // a reset changes no field state: no `dirty`, no cleared server errors
                events.mounted(options.input(), value, filled);
                return;
            }
            events.changed(
                options.input(),
                value,
                serialized !== initial,
                filled,
            );
        });
    });

    // inside a `form[formRoot]`, its submission validates the field instead; outside one, the
    // native form is found once the control's elements render (a group's checkboxes, a picker's
    // trigger), and listened to until the control is destroyed
    let stop: (() => void) | null = null;
    if (!field.inForm) {
        afterRenderEffect(() => {
            if (stop !== null) {
                return;
            }
            const form =
                options.input()?.form ??
                (options.element?.() ?? options.focusTarget())?.closest(
                    "form",
                ) ??
                null;
            if (form === null) {
                return;
            }
            stop = onSubmitAttempt(form, () =>
                events.submitAttempt(options.input(), untracked(options.value)),
            );
        });
    }
    inject(DestroyRef).onDestroy(() => stop?.());

    return {
        inField: true,
        name: field.name,
        disabled: field.isDisabled,
        // a control named by its own content too (a picker's Trigger) adds itself, so its visible
        // text stays in its name (WCAG 2.5.3, spec/field.md)
        labelledBy: computed(() => {
            const label = field.labelId();
            const id = options.id();
            return options.focusOnLabel &&
                label !== undefined &&
                id !== undefined
                ? `${label} ${id}`
                : (label ?? null);
        }),
        describedBy: computed(() => field.describedBy() ?? null),
        ariaInvalid: computed(() => (field.showsInvalid() ? "true" : null)),
        data: field.data,
        focused: events.focused,
        blurred: () =>
            events.blurred(options.input(), untracked(options.value)),
        reset: () => {
            resetting = true;
            resets.update((count) => count + 1);
        },
    };
}

/**
 * Writes a field's ARIA (`aria-labelledby`, `aria-describedby`, `aria-invalid`) on a control's
 * element, in its directive's injection context. Only inside a field: outside one, the element's
 * attributes stay the consumer's, static or bound, as without the layer. Inside, a consumer's own
 * static attribute wins over the field's value.
 */
export function writeFieldAria(
    binding: FieldControlBinding,
    host: HTMLElement,
    attributes: Partial<Record<string, () => string | null>>,
): void {
    const own = Object.fromEntries(
        Object.keys(attributes).map((name) => [name, ownAttribute(name)]),
    );
    if (!binding.inField) {
        return;
    }
    effect(() => {
        for (const [name, value] of Object.entries(attributes)) {
            const next = own[name] ?? value?.() ?? null;
            if (next === null) {
                host.removeAttribute(name);
            } else {
                host.setAttribute(name, next);
            }
        }
    });
}
