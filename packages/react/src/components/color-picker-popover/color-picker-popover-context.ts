import type { Align, Side } from "@fragiola/primitives/positioning";
import { createContext } from "react";
import type { OverlayRoot } from "../../hooks/use-overlay-root.ts";

export interface ColorPickerPopoverContextValue extends OverlayRoot {
    placed: { side: Side; align: Align };
    setPlaced: (placed: { side: Side; align: Align }) => void;
    /** The enclosing ColorPicker is disabled: the trigger opens nothing. */
    disabled: boolean;
}

export const ColorPickerPopoverContext =
    createContext<ColorPickerPopoverContextValue | null>(null);
