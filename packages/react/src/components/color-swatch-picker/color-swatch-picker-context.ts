import type { Color } from "@fragiola/primitives/color";
import { createContext } from "react";

/** A rendered Item, as the Root knows it. */
export interface ColorSwatchPickerItemEntry {
    element: HTMLElement;
    /** Its color's key: `formatColor(color, "hexa")`. */
    key: string;
    color: Color;
    disabled: boolean;
}

export interface ColorSwatchPickerContextValue {
    disabled: boolean;
    /** The selected color's key, or `null`. */
    selected: string | null;
    /** The Item holding the tab stop (`tabindex="0"`); `null` before the items are known. */
    tabStop: HTMLElement | null;
    /** The focused Item while the focus is in the list (`data-highlighted`). */
    highlighted: HTMLElement | null;
    register: (entry: ColorSwatchPickerItemEntry) => () => void;
    /** An Item took focus. */
    focused: (element: HTMLElement) => void;
    /** A press on an Item. */
    press: (element: HTMLElement, event: MouseEvent) => void;
}

export const ColorSwatchPickerContext =
    createContext<ColorSwatchPickerContextValue | null>(null);
