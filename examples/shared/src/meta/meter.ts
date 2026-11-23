import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Storage meter",
    description:
        "A disk's use written in gigabytes with a number format, and a battery's charge written as a percentage; the indicator grows from the inline start.",
    category: "display",
    order: 2,
    features: [
        "Meter.Root",
        "Meter.Label",
        "Meter.Value",
        "Meter.Track",
        "Meter.Indicator",
        "format",
    ],
    docs: "/docs/api/meter",
    height: 220,
} satisfies ExampleMeta;
