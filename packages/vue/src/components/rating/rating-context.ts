import type { ComputedRef, InjectionKey } from "vue";
import type { ChangeReason } from "../../utils/change-details.ts";

export interface RatingContext {
    /** The score, `0` for none. */
    value: ComputedRef<number>;
    /** The value the stars draw: the pointer's preview while it runs, else the value. */
    displayed: ComputedRef<number>;
    allowHalf: () => boolean;
    /** A press on the current value clears it. */
    allowClear: () => boolean;
    disabled: () => boolean;
    readOnly: () => boolean;
    required: () => boolean;
    /** The HiddenInput's name: the Root's, or its Field's. */
    name: () => string | undefined;
    /** The star holding the tab stop (1 to `count`), `null` for none (disabled). */
    tabStop: ComputedRef<number | null>;
    /** Sets the value. */
    choose: (value: number, reason: ChangeReason, event: Event) => void;
    /** The pointer's preview over a star, `null` when it left the Root. */
    preview: (value: number | null) => void;
    /** A key on a star (spec/rating.md, "Keyboard"); `true` when it was handled. */
    keyDown: (key: string, index: number, event: Event) => boolean;
    /** A star's element, which a key focuses once the value moved to it. */
    registerItem: (index: number, element: HTMLElement) => () => void;
    /** The HiddenInput's element, for the Field and the form bridge. */
    setHiddenInput: (input: HTMLInputElement | null) => void;
    /** A form reset: back to `defaultValue`. */
    reset: () => void;
    /** The tab stop's element, where a failed validation sends the focus. */
    tabStopElement: () => HTMLElement | null;
}

export const RatingKey: InjectionKey<RatingContext> = Symbol("Rating");
