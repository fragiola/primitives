import type { ScrubPoint } from "@fragiola/primitives/number";
import { createContext } from "react";
import type { FieldControlBinding } from "../../hooks/use-field-control.ts";
import type { ChangeReason } from "../../utils/change-details.ts";

/** The state every part renders with (spec/number-field.md, "State attributes and ARIA"). */
export interface NumberFieldState {
    /** The value: a number, or `null` while empty. */
    value: number | null;
    /** The Input's text. */
    inputValue: string;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    scrubbing: boolean;
}

export interface NumberFieldContextValue extends NumberFieldState {
    inputId: string;
    min: number | undefined;
    max: number | undefined;
    locale: string | undefined;
    format: Intl.NumberFormatOptions | undefined;
    /** The value as `format` writes it (`aria-valuetext`), `""` while empty. */
    formattedValue: string;
    allowWheelScrub: boolean;
    field: FieldControlBinding;
    /** The state attributes and the field's, for every part. */
    attributes: Record<`data-${string}`, string>;
    /** The amount of one step for an event's modifier keys (Alt: small, Shift: large). */
    amount: (
        event: { altKey?: boolean; shiftKey?: boolean } | undefined,
    ) => number;
    /**
     * Steps `times` times by `amount` (negative: down) from the value (or the typed text): returns
     * whether another step that way could still change it (a bound not reached).
     */
    stepBy: (
        amount: number,
        reason: ChangeReason,
        event: Event | undefined,
        times?: number,
    ) => boolean;
    /** Sets the value, as a step does (Home and End set a bound). */
    stepTo: (
        value: number,
        reason: ChangeReason,
        event: Event | undefined,
    ) => void;
    /** The Input's text changed. */
    onInputText: (text: string, event: Event) => boolean;
    /** The Input lost focus. */
    onInputBlur: (event: Event) => void;
    setInputElement: (element: HTMLInputElement | null) => void;
    setScrubbing: (scrubbing: boolean) => void;
    cursor: ScrubPoint | null;
    setCursor: (point: ScrubPoint | null) => void;
}

export const NumberFieldContext = createContext<NumberFieldContextValue | null>(
    null,
);

/** The state the parts render with. */
export function numberFieldState(
    context: NumberFieldContextValue,
): NumberFieldState {
    return {
        value: context.value,
        inputValue: context.inputValue,
        disabled: context.disabled,
        readOnly: context.readOnly,
        required: context.required,
        scrubbing: context.scrubbing,
    };
}
