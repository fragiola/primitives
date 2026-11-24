import type { Recipe } from "./recipe.ts";
import { BUTTON, FLOATING_BOX, FOCUS_RING } from "./shared.ts";

// spec/color-picker.md, `/color-picker-popover`. The Trigger frames the swatch it holds; the Popup
// is a floating box stacking the controls.
export const colorPickerPopover: Recipe<"trigger" | "positioner" | "popup"> = {
    trigger: `${BUTTON} px-1.5 data-popup-open:bg-palette-soft`,
    positioner: "z-50",
    popup: `${FLOATING_BOX} flex flex-col items-start gap-3 p-3 ${FOCUS_RING}`,
};
