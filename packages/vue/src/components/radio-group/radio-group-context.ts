import type { ComputedRef, InjectionKey } from "vue";

/** A radio of the group, as it registered; each getter is read when it is needed. */
export interface RadioEntry {
    value: () => string;
    disabled: () => boolean;
    element: () => HTMLElement | null;
}

export interface RadioGroupContext {
    /** The checked radio's value, `null` for none. */
    value: ComputedRef<string | null>;
    disabled: () => boolean;
    required: () => boolean;
    /** The hidden inputs' name: the group's, or its Field's. */
    name: () => string | undefined;
    /** The value of the radio holding the group's tab stop, `null` before any radio registered. */
    tabStop: ComputedRef<string | null>;
    /** Checks a radio. */
    select: (value: string) => void;
    /** An arrow key on a radio: moves the focus and the check (spec/radio-group.md, "Keyboard"). */
    navigate: (key: string, from: HTMLElement) => boolean;
    /** A form reset: back to `defaultValue`. */
    reset: () => void;
    /** The group's tab stop's element, where a failed validation sends the focus. */
    tabStopElement: () => HTMLElement | null;
    register: (entry: RadioEntry) => () => void;
}

export const RadioGroupKey: InjectionKey<RadioGroupContext> =
    Symbol("RadioGroup");
