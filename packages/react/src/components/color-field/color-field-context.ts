import type {
    Color,
    ColorChannel,
    ColorChannelRange,
} from "@fragiola/primitives/color";
import { createContext } from "react";
import type { FieldControlBinding } from "../../hooks/use-field-control.ts";

export interface ColorFieldContextValue {
    /** The value (in the field's space, with `channel`), `null` when empty. */
    value: Color | null;
    channel: ColorChannel | undefined;
    /** The channel's value (channel mode), `null` when empty. */
    channelValue: number | null;
    range: ColorChannelRange | undefined;
    /** The text the Input shows: the typed text while editing, else the value's. */
    inputValue: string;
    /** The value's text (the channel's, with `channel`). */
    valueText: string;
    inputId: string;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    field: FieldControlBinding;
    attributes: Record<`data-${string}`, string>;
    onInputText: (text: string) => void;
    /** Parses the typed text and sets the value, or goes back to the value's text. */
    commitText: (reason: "keyboard" | "input-blur", event: Event) => void;
    /** Handles a step key (`true` when it did). */
    stepKey: (key: string, shiftKey: boolean, event: Event) => boolean;
    setInputElement: (element: HTMLInputElement | null) => void;
}

export const ColorFieldContext = createContext<ColorFieldContextValue | null>(
    null,
);

/** The state every color field part shares. */
export interface ColorFieldState {
    value: Color | null;
    inputValue: string;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

export function colorFieldState(
    context: ColorFieldContextValue,
): ColorFieldState {
    return {
        value: context.value,
        inputValue: context.inputValue,
        disabled: context.disabled,
        readOnly: context.readOnly,
        required: context.required,
    };
}
