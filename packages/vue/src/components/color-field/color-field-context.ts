import type {
    Color,
    ColorChannel,
    ColorChannelRange,
} from "@fragiola/primitives/color";
import type { ComputedRef, InjectionKey } from "vue";
import type { FieldControlBinding } from "../../composables/use-field-control.ts";

export interface ColorFieldContext {
    state: ComputedRef<ColorFieldState>;
    channel: () => ColorChannel | undefined;
    /** The channel's value (channel mode), `null` when empty. */
    channelValue: ComputedRef<number | null>;
    range: () => ColorChannelRange | undefined;
    /** The value's text (the channel's, with `channel`). */
    valueText: ComputedRef<string>;
    inputId: () => string;
    field: FieldControlBinding;
    /** The Root's state attributes and the field's, for the Input too. */
    attributes: () => Record<string, string>;
    onInputText: (text: string) => void;
    /** Parses the typed text and sets the value, or goes back to the value's text. */
    commitText: (reason: "keyboard" | "input-blur", event: Event) => void;
    /** Handles a step key (`true` when it did). */
    stepKey: (key: string, shiftKey: boolean, event: Event) => boolean;
    setInputElement: (value: unknown) => void;
}

export const ColorFieldKey: InjectionKey<ColorFieldContext> =
    Symbol("ColorField");

/** The state every color field part shares. */
export interface ColorFieldState {
    value: Color | null;
    inputValue: string;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}
