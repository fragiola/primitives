import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Tabbed feature carousel",
    description:
        "Three feature slides picked from a tablist: the arrow keys move between the tabs and show their slides, each slide a tabpanel the tabs control.",
    category: "display",
    order: 9,
    features: [
        'variant="tabbed"',
        "Carousel.IndicatorGroup",
        "Carousel.Indicator",
    ],
    docs: "/docs/api/carousel",
    height: 320,
} satisfies ExampleMeta;
