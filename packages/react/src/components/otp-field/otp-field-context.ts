import { createContext, type KeyboardEvent } from "react";
import type { FieldControlBinding } from "../../hooks/use-field-control.ts";

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

export interface OTPFieldContextValue extends OTPFieldState {
    field: FieldControlBinding;
    /** The first slot's `id`; slot `n` gets `<id>-<n>`. */
    id: string;
    mask: boolean;
    autoComplete: string;
    inputMode: string;
    /** The slot holding the tab stop. */
    activeIndex: number;
    /** The state attributes and the field's, for every part. */
    attributes: Record<`data-${string}`, string>;
    /** Registers a slot; returns the cleanup. */
    register: (element: HTMLInputElement) => () => void;
    /** A slot's index in document order, `-1` while unknown. */
    indexOf: (element: HTMLInputElement | null) => number;
    onSlotText: (index: number, text: string, event: Event) => void;
    onSlotPaste: (index: number, text: string, event: Event) => void;
    onSlotKeyDown: (
        index: number,
        event: KeyboardEvent<HTMLInputElement>,
    ) => void;
    onSlotFocus: (index: number, element: HTMLInputElement) => void;
    onSlotBlur: (related: EventTarget | null) => void;
    /** Focuses a slot, or the first empty one when it lies after it (no gap). */
    focusSlot: (index: number) => void;
}

export const OTPFieldContext = createContext<OTPFieldContextValue | null>(null);

/** The state the Root renders with. */
export function otpFieldState(context: OTPFieldContextValue): OTPFieldState {
    return {
        value: context.value,
        length: context.length,
        complete: context.complete,
        disabled: context.disabled,
        readOnly: context.readOnly,
        required: context.required,
    };
}
