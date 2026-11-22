import {
    afterNextRender,
    afterRenderEffect,
    computed,
    DestroyRef,
    effect,
    inject,
    type Signal,
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
    afterRenderEffect(() => {
        const value = options.value();
        const filled = options.filled();
        const serialized = serialize(value);
        untracked(() => {
            if (initial === null) {
                initial = serialized;
                previous = serialized;
                events.mounted(options.input(), value, filled);
                return;
            }
            if (previous === serialized) {
                return;
            }
            previous = serialized;
            events.changed(
                options.input(),
                value,
                serialized !== initial,
                filled,
            );
        });
    });

    // inside a `form[formRoot]`, its submission validates the field instead
    let stop: (() => void) | null = null;
    afterNextRender(() => {
        if (field.inForm) {
            return;
        }
        const form = options.input()?.form;
        if (form === null || form === undefined) {
            return;
        }
        stop = onSubmitAttempt(form, () =>
            events.submitAttempt(options.input(), untracked(options.value)),
        );
    });
    inject(DestroyRef).onDestroy(() => stop?.());

    return {
        inField: true,
        name: field.name,
        disabled: field.isDisabled,
        labelledBy: computed(() => field.labelId() ?? null),
        describedBy: computed(() => field.describedBy() ?? null),
        ariaInvalid: computed(() => (field.showsInvalid() ? "true" : null)),
        data: field.data,
        focused: events.focused,
        blurred: () =>
            events.blurred(options.input(), untracked(options.value)),
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
