import type { Color } from "@fragiola/primitives/color";
import type { ComputedRef, InjectionKey } from "vue";

/** An Item of the palette, as it registered; each getter is read when it is needed. */
export interface ColorSwatchPickerItemEntry {
    element: HTMLElement;
    /** Its color's key: `formatColor(color, "hexa")`. */
    key: () => string;
    color: () => Color;
    disabled: () => boolean;
}

export interface ColorSwatchPickerContext {
    disabled: () => boolean;
    /** The selected color's key, or `null`. */
    selected: ComputedRef<string | null>;
    /** The Item holding the tab stop (`tabindex="0"`); `null` before the items are known. */
    tabStop: ComputedRef<HTMLElement | null>;
    /** The focused Item while the focus is in the list (`data-highlighted`). */
    highlighted: ComputedRef<HTMLElement | null>;
    register: (entry: ColorSwatchPickerItemEntry) => () => void;
    /** An Item took focus. */
    focused: (element: HTMLElement) => void;
    /** A press on an Item. */
    press: (element: HTMLElement, event: MouseEvent) => void;
}

export const ColorSwatchPickerKey: InjectionKey<ColorSwatchPickerContext> =
    Symbol("ColorSwatchPicker");
