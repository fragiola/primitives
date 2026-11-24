import { colorArea } from "examples-shared/recipes/color-area";
import { colorField } from "examples-shared/recipes/color-field";
import { colorPicker } from "examples-shared/recipes/color-picker";
import { colorPickerPopover } from "examples-shared/recipes/color-picker-popover";
import { colorSlider } from "examples-shared/recipes/color-slider";
import { colorSwatch } from "examples-shared/recipes/color-swatch";
import { colorSwatchPicker } from "examples-shared/recipes/color-swatch-picker";

// The example's classes: the color recipes (their gradients, swatches and thumbs drawn from the
// parts' CSS variables), the popup's rows, the channel fields and the preview of the theme color.
export const styles = {
    picker: colorPicker,
    popover: colorPickerPopover,
    area: colorArea,
    slider: colorSlider,
    field: colorField,
    swatch: colorSwatch,
    swatches: colorSwatchPicker,
    columns: "flex items-start gap-4",
    column: "flex flex-col items-start gap-3",
    row: "flex flex-wrap items-center gap-3",
    formatSelect: colorPicker["format-select"],
    eyeDropper: colorPicker["eye-dropper-trigger"],
    channels: "flex gap-2",
    channelInput: `${colorField.input} w-20`,
    label: "font-medium",
    hex: "tabular-nums",
    preview:
        "rounded-control px-3 py-2 font-medium text-white [background:var(--color-picker-color)]",
};
