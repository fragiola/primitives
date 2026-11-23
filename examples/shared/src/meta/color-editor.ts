import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "HSL color editor",
    description:
        "One color shared by four controls: a ColorWheel for the hue, a ColorArea for saturation and lightness, an opacity ColorSlider and a hex ColorField; each reports the color in its own space, and the swatch shows it.",
    category: "forms",
    order: 27,
    features: [
        "ColorWheel.Root",
        "ColorArea.Root",
        "ColorArea.Input",
        "ColorSlider.Root",
        "ColorSlider.Output",
        "ColorField.Root",
        "colorSpace",
        "channel",
        "formatColor",
    ],
    docs: "/docs/api/color-area",
    height: 420,
} satisfies ExampleMeta;
