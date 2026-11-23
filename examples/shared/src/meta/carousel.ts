import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Image carousel",
    description:
        "Four photos that rotate every five seconds: the rotation control first, focus inside or a hover stopping or pausing it, Previous and Next that loop, and a dot for each slide.",
    category: "display",
    order: 8,
    features: [
        "Carousel.AutoplayTrigger",
        "Carousel.ItemGroup",
        "Carousel.Item",
        "Carousel.Indicator",
        "defaultPlaying",
        "loop",
    ],
    docs: "/docs/api/carousel",
    height: 360,
} satisfies ExampleMeta;
