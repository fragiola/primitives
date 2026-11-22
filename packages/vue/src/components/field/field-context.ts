import type { FieldState, FieldValidation } from "@fragiola/primitives/form";
import type { ComputedRef, InjectionKey, Ref, ShallowRef } from "vue";

/** What a control inside the field reports (spec/field.md, "Integration contract"). */
export interface FieldControlEvents {
    /**
     * The control mounted, or its form was reset (no change: spec/form.md): its value, whether it
     * is filled. Sets the custom validity, shows nothing.
     */
    mounted: (
        input: HTMLInputElement | null,
        value: unknown,
        filled: boolean,
    ) => void;
    changed: (
        input: HTMLInputElement | null,
        value: unknown,
        dirty: boolean,
        filled: boolean,
    ) => void;
    focused: () => void;
    blurred: (input: HTMLInputElement | null, value: unknown) => void;
    /** A submission attempt: validates and shows the result; whether the field is invalid now. */
    submitAttempt: (input: HTMLInputElement | null, value: unknown) => boolean;
}

/** The control the field holds: what a Form's submission validates and focuses. */
export interface FieldControlHandle {
    /** The element the form validates (`null`: none, `validate` decides). */
    input: () => HTMLInputElement | null;
    value: () => unknown;
    /** The element a Form focuses when the field is the first invalid one. */
    focusTarget: () => HTMLElement | null;
}

/** The control the Label points at. */
export interface FieldControlEntry {
    id: string;
    /** Whether `<label for>` can point at it (a native input or a `button`). */
    labelable: boolean;
    /**
     * A press on the Label focuses the control instead of clicking it (a picker's trigger, whose
     * click would open its popup; spec/field.md "Focus").
     */
    labelFocuses: boolean;
}

export interface FieldContext {
    state: ComputedRef<FieldState>;
    /** `aria-invalid`: the field shows an error and is not disabled. */
    invalid: ComputedRef<boolean>;
    name: () => string | undefined;
    /** Its own `disabled`, or an enclosing Fieldset's. */
    disabled: () => boolean;
    /** Inside a Form: the Form validates it on submission, not the native form events. */
    inForm: boolean;
    shown: ShallowRef<FieldValidation>;
    /** The enclosing Form's errors for the field's `name`. */
    formErrors: ComputedRef<readonly string[]>;
    labelId: Ref<string | undefined>;
    /** The control's id, whether `<label for>` can point at it, and what a press on the label does. */
    control: ShallowRef<FieldControlEntry | null>;
    registerControl: (entry: FieldControlEntry) => () => void;
    /** The control's value, validated element and focus target, for a Form's submission. */
    attachControl: (handle: FieldControlHandle) => () => void;
    describedBy: ComputedRef<string | undefined>;
    /** A description, or a shown error: listed in the control's `aria-describedby`. */
    registerMessage: (element: HTMLElement) => () => void;
    events: FieldControlEvents;
}

export const FieldKey: InjectionKey<FieldContext> = Symbol("Field");
