import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Upload progress",
    description:
        "An upload's progress written as a percentage, which the buttons move or make indeterminate, and a disk's use written in gigabytes with a number format; the indicator grows from the inline start.",
    category: "display",
    order: 1,
    features: [
        "Progress.Root",
        "Progress.Label",
        "Progress.Value",
        "Progress.Track",
        "Progress.Indicator",
        "format",
    ],
    docs: "/docs/api/progress",
    height: 280,
} satisfies ExampleMeta;
