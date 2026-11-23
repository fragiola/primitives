import type { ComputedRef, InjectionKey } from "vue";
import type { FieldControlBinding } from "../../composables/use-field-control.ts";

/** The state every part renders with (spec/otp-field.md, "State attributes and ARIA"). */
export interface OTPFieldState {
    /** The code typed so far. */
    value: string;
    length: number;
    /** The value is `length` characters long. */
    complete: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

export interface OTPFieldInputState extends OTPFieldState {
    /** The slot's index; `-1` before the slots are known (a server render). */
    index: number;
    /** The slot's character, `""` when empty. */
    character: string;
    /** The slot holds a character. */
    filled: boolean;
}

export interface OTPFieldContext {
    state: ComputedRef<OTPFieldState>;
    field: FieldControlBinding;
    /** The first slot's `id`; slot `n` gets `<id>-<n>`. */
    id: () => string;
    mask: () => boolean;
    autoComplete: () => string;
    inputMode: () => string;
    /** The slot holding the tab stop. */
    activeIndex: () => number;
    /** The state attributes and the field's, for every part. */
    attributes: () => Record<string, string>;
    /** Registers a slot; returns the cleanup. */
    register: (element: HTMLInputElement) => () => void;
    /** A slot's index in document order, `-1` while unknown. */
    indexOf: (element: HTMLInputElement | null) => number;
    onSlotText: (index: number, text: string, event: Event) => void;
    onSlotPaste: (index: number, text: string, event: Event) => void;
    onSlotKeydown: (index: number, event: KeyboardEvent) => void;
    onSlotFocus: (index: number, element: HTMLInputElement) => void;
    onSlotBlur: (related: EventTarget | null) => void;
    /** Focuses a slot, or the first empty one when it lies after it (no gap). */
    focusSlot: (index: number) => void;
}

export const OTPFieldKey: InjectionKey<OTPFieldContext> = Symbol("OTPField");
