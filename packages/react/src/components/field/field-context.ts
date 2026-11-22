import type { FieldState, FieldValidation } from "@fragiola/primitives/form";
import { createContext } from "react";

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
    /** A submission attempt of the control's native form; whether the field is invalid now. */
    submitAttempt: (input: HTMLInputElement | null, value: unknown) => boolean;
}

/** The control's live side, which the field reads on a Form's submission (spec/field.md). */
export interface FieldControlHandle {
    /** The element the form validates (`null` for none). */
    input: () => HTMLInputElement | null;
    value: () => unknown;
    /** The element a Form focuses when the field is the first invalid one. */
    focusTarget: () => HTMLElement | null;
}

export interface FieldControlInfo {
    id: string;
    labelable: boolean;
    labelFocuses: boolean;
}

export interface FieldContextValue {
    state: FieldState;
    /** `aria-invalid`: the field shows an error and is not disabled. */
    invalid: boolean;
    name: string | undefined;
    disabled: boolean;
    shown: FieldValidation;
    /** The enclosing Form's errors for the field's `name` (empty for none). */
    formErrors: readonly string[];
    /** Inside a Form: the Form runs the submission attempts, not the native form. */
    inForm: boolean;
    labelId: string | undefined;
    setLabelId: (id: string | undefined) => void;
    /**
     * The control's id, whether `<label for>` can point at it, and whether a press on the label
     * only focuses it (a picker's trigger, which a click would open).
     */
    control: FieldControlInfo | null;
    registerControl: (info: FieldControlInfo) => () => void;
    /** The control's handle, for the Form's submission. */
    attach: (handle: FieldControlHandle) => () => void;
    describedBy: string | undefined;
    /** A description, or a shown error: listed in the control's `aria-describedby`. */
    registerMessage: (element: HTMLElement) => () => void;
    events: FieldControlEvents;
}

export const FieldContext = createContext<FieldContextValue | null>(null);
