import {
    ColorAreaInput,
    ColorAreaRoot,
    ColorAreaThumb,
} from "@fragiola/primitives-angular/color-area";
import {
    ColorFieldInput,
    ColorFieldRoot,
} from "@fragiola/primitives-angular/color-field";
import {
    ColorPickerEyeDropperTrigger,
    ColorPickerFormatSelect,
    ColorPickerRoot,
} from "@fragiola/primitives-angular/color-picker";
import {
    ColorPickerPopoverPopup,
    ColorPickerPopoverPortal,
    ColorPickerPopoverPositioner,
    ColorPickerPopoverRoot,
    ColorPickerPopoverTrigger,
} from "@fragiola/primitives-angular/color-picker-popover";
import {
    ColorSliderRoot,
    ColorSliderThumb,
    ColorSliderTrack,
} from "@fragiola/primitives-angular/color-slider";
import { ColorSwatch } from "@fragiola/primitives-angular/color-swatch";
import {
    ColorSwatchPickerItem,
    ColorSwatchPickerRoot,
} from "@fragiola/primitives-angular/color-swatch-picker";
import { colorArea } from "examples-shared/recipes/color-area";
import { colorField } from "examples-shared/recipes/color-field";
import { colorPicker } from "examples-shared/recipes/color-picker";
import { colorPickerPopover } from "examples-shared/recipes/color-picker-popover";
import { colorSlider } from "examples-shared/recipes/color-slider";
import { colorSwatch } from "examples-shared/recipes/color-swatch";
import { colorSwatchPicker } from "examples-shared/recipes/color-swatch-picker";

/** Every directive the ColorPicker scenarios use, for their `imports`. */
export const COLOR_PICKER_PARTS = [
    ColorPickerRoot,
    ColorPickerFormatSelect,
    ColorPickerEyeDropperTrigger,
    ColorPickerPopoverRoot,
    ColorPickerPopoverTrigger,
    ColorPickerPopoverPortal,
    ColorPickerPopoverPositioner,
    ColorPickerPopoverPopup,
    ColorAreaRoot,
    ColorAreaThumb,
    ColorAreaInput,
    ColorSliderRoot,
    ColorSliderTrack,
    ColorSliderThumb,
    ColorFieldRoot,
    ColorFieldInput,
    ColorSwatch,
    ColorSwatchPickerRoot,
    ColorSwatchPickerItem,
] as const;

/** The recipes of every part they use. */
export const COLOR_PICKER_STYLES = {
    picker: colorPicker,
    popover: colorPickerPopover,
    area: colorArea,
    slider: colorSlider,
    field: colorField,
    swatch: colorSwatch,
    swatchPicker: colorSwatchPicker,
};
