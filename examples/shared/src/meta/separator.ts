import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Profile card",
    description:
        "A horizontal separator between a card's sections, vertical ones between its links, and a decorative one that assistive technologies skip; each is drawn along its orientation.",
    category: "display",
    order: 3,
    features: ["Separator", "orientation", "decorative"],
    docs: "/docs/api/separator",
    height: 240,
} satisfies ExampleMeta;
