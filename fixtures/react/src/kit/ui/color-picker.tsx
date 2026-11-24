import { ColorPicker as Primitive } from "@fragiola/primitives-react/color-picker";
import { ColorPickerPopover as PopoverPrimitive } from "@fragiola/primitives-react/color-picker-popover";
import { colorPicker } from "examples-shared/recipes/color-picker";
import { colorPickerPopover } from "examples-shared/recipes/color-picker-popover";
import type { ComponentProps } from "react";

export const ColorPicker = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={colorPicker.root} {...props} />
    ),
    FormatSelect: (props: ComponentProps<typeof Primitive.FormatSelect>) => (
        <Primitive.FormatSelect
            className={colorPicker["format-select"]}
            {...props}
        />
    ),
    EyeDropperTrigger: (
        props: ComponentProps<typeof Primitive.EyeDropperTrigger>,
    ) => (
        <Primitive.EyeDropperTrigger
            className={colorPicker["eye-dropper-trigger"]}
            {...props}
        />
    ),
};

export const ColorPickerPopover = {
    Root: PopoverPrimitive.Root,
    Portal: PopoverPrimitive.Portal,
    Trigger: (props: ComponentProps<typeof PopoverPrimitive.Trigger>) => (
        <PopoverPrimitive.Trigger
            className={colorPickerPopover.trigger}
            {...props}
        />
    ),
    Positioner: (props: ComponentProps<typeof PopoverPrimitive.Positioner>) => (
        <PopoverPrimitive.Positioner
            className={colorPickerPopover.positioner}
            {...props}
        />
    ),
    Popup: (props: ComponentProps<typeof PopoverPrimitive.Popup>) => (
        <PopoverPrimitive.Popup
            className={colorPickerPopover.popup}
            {...props}
        />
    ),
};
