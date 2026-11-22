import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Volume and price",
    description:
        "A slider and a two-thumb range: drag a thumb or press the track, step with the arrows, jump with Page Up and Page Down; the price thumbs stay ten apart.",
    category: "forms",
    order: 3,
    features: [
        "Slider.Root",
        "Slider.Control",
        "Slider.Track",
        "Slider.Indicator",
        "Slider.Thumb",
        "minStepsBetweenValues",
        "getAriaValueText",
    ],
    docs: "/docs/api/slider",
    height: 320,
} satisfies ExampleMeta;
