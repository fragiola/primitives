import { ColorPickerPopoverPopup } from "./color-picker-popover-popup.tsx";
import { ColorPickerPopoverPortal } from "./color-picker-popover-portal.tsx";
import { ColorPickerPopoverPositioner } from "./color-picker-popover-positioner.tsx";
import { ColorPickerPopoverRoot } from "./color-picker-popover-root.tsx";
import { ColorPickerPopoverTrigger } from "./color-picker-popover-trigger.tsx";

/** spec/color-picker.md: a ColorPicker's opt-in popup, on Popover's overlay lifecycle */
export const ColorPickerPopover = {
    Root: ColorPickerPopoverRoot,
    Trigger: ColorPickerPopoverTrigger,
    Portal: ColorPickerPopoverPortal,
    Positioner: ColorPickerPopoverPositioner,
    Popup: ColorPickerPopoverPopup,
};
