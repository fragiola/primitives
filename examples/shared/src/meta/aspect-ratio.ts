import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Image frame",
    description:
        "A 16:9 frame that keeps its ratio as its column narrows or widens, the picture inside it covering it, with a caption under it.",
    category: "display",
    order: 6,
    features: ["AspectRatio", "ratio"],
    docs: "/docs/api/aspect-ratio",
    height: 300,
} satisfies ExampleMeta;
