import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "FAQ",
    description:
        "Frequently asked questions, one answer open at a time: the arrow keys, Home and End move between the questions, and find-in-page opens the answer that matches.",
    category: "disclosure",
    order: 2,
    features: [
        "Accordion.Root",
        "Accordion.Item",
        "Accordion.Header",
        "Accordion.Trigger",
        "Accordion.Panel",
        "defaultValue",
        "hiddenUntilFound",
    ],
    docs: "/docs/api/accordion",
    height: 360,
} satisfies ExampleMeta;
