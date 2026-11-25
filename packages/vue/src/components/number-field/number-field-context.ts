import type { ScrubPoint } from "@fragiola/primitives/number";
import type { ComputedRef, InjectionKey, Ref } from "vue";
import type { FieldControlBinding } from "../../composables/use-field-control.ts";
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

export interface NumberFieldContext {
    state: ComputedRef<NumberFieldState>;
    inputId: () => string;
    min: () => number | undefined;
    max: () => number | undefined;
    format: () => Intl.NumberFormatOptions | undefined;
    /** The value as `format` writes it (`aria-valuetext`), `""` while empty. */
    formattedValue: () => string;
    allowWheelScrub: () => boolean;
    field: FieldControlBinding;
    /** The state attributes and the field's, for every part. */
    attributes: () => Record<string, string>;
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
    /** The Input's text changed: `false` when it is refused (the text stays as it was). */
    onInputText: (text: string, event: Event) => boolean;
    /** The Input lost focus. */
    onInputBlur: (event: Event) => void;
    /** A button press or a scrub ended: reports a pending change (`valueCommitted`). */
    commit: (event: Event | undefined) => void;
    setInputElement: (value: unknown) => void;
    scrubbing: Ref<boolean>;
    /** The virtual cursor of a locked scrub, `null` otherwise. */
    cursor: Ref<ScrubPoint | null>;
}

export const NumberFieldKey: InjectionKey<NumberFieldContext> =
    Symbol("NumberField");
