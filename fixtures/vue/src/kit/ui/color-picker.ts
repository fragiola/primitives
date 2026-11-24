import { ColorPicker as Primitive } from "@fragiola/primitives-vue/color-picker";
import { ColorPickerPopover as PopoverPrimitive } from "@fragiola/primitives-vue/color-picker-popover";
import { colorPicker } from "examples-shared/recipes/color-picker";
import { colorPickerPopover } from "examples-shared/recipes/color-picker-popover";
import { styled } from "../styled.ts";

export const ColorPicker = {
    Root: styled(Primitive.Root, colorPicker.root),
    FormatSelect: styled(Primitive.FormatSelect, colorPicker["format-select"]),
    EyeDropperTrigger: styled(
        Primitive.EyeDropperTrigger,
        colorPicker["eye-dropper-trigger"],
    ),
};

export const ColorPickerPopover = {
    Root: PopoverPrimitive.Root,
    Portal: PopoverPrimitive.Portal,
    Trigger: styled(PopoverPrimitive.Trigger, colorPickerPopover.trigger),
    Positioner: styled(
        PopoverPrimitive.Positioner,
        colorPickerPopover.positioner,
    ),
    Popup: styled(PopoverPrimitive.Popup, colorPickerPopover.popup),
};
