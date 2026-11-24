import { ColorPickerPopoverPopup } from "./color-picker-popover-popup.ts";
import { ColorPickerPopoverPortal } from "./color-picker-popover-portal.ts";
import { ColorPickerPopoverPositioner } from "./color-picker-popover-positioner.ts";
import { ColorPickerPopoverRoot } from "./color-picker-popover-root.ts";
import { ColorPickerPopoverTrigger } from "./color-picker-popover-trigger.ts";

/** spec/color-picker.md: a ColorPicker's opt-in popup, on Popover's overlay lifecycle */
export const ColorPickerPopover = {
    Root: ColorPickerPopoverRoot,
    Trigger: ColorPickerPopoverTrigger,
    Portal: ColorPickerPopoverPortal,
    Positioner: ColorPickerPopoverPositioner,
    Popup: ColorPickerPopoverPopup,
};
