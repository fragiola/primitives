import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Theme color picker",
    description:
        "A theme color chosen in a popover: one ColorPicker shares its color with a ColorArea, a hue and an opacity ColorSlider, the fields of the chosen format (hex, RGB, HSL or HSB), a palette of presets and the browser's eyedropper; the trigger's swatch and the preview follow it.",
    category: "forms",
    order: 28,
    features: [
        "ColorPicker.Root",
        "ColorPicker.FormatSelect",
        "ColorPicker.EyeDropperTrigger",
        "ColorPickerPopover.Trigger",
        "ColorPickerPopover.Popup",
        "ColorSwatchPicker.Root",
        "ColorSwatch",
        "ColorField.Root",
        "channel",
        "formatColor",
    ],
    docs: "/docs/api/color-picker",
    height: 400,
} satisfies ExampleMeta;
