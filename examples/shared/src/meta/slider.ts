import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Volume and price",
    description:
        "A slider and a two-thumb range, each named by its label and showing its formatted value: drag a thumb or press the track, step with the arrows, jump with Page Up and Page Down; the price thumbs stay ten apart.",
    category: "forms",
    order: 3,
    features: [
        "Slider.Root",
        "Slider.Label",
        "Slider.Value",
        "Slider.Control",
        "Slider.Track",
        "Slider.Indicator",
        "Slider.Thumb",
        "minStepsBetweenValues",
        "format",
    ],
    docs: "/docs/api/slider",
    height: 320,
} satisfies ExampleMeta;
