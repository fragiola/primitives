import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Settings sidebar",
    description:
        "A sidebar whose sections show and hide their links, with a height transition on the panel's size variable; find-in-page opens the section that holds a match.",
    category: "disclosure",
    order: 1,
    features: [
        "Collapsible.Root",
        "Collapsible.Trigger",
        "Collapsible.Panel",
        "defaultOpen",
        "hiddenUntilFound",
    ],
    docs: "/docs/api/collapsible",
    height: 320,
} satisfies ExampleMeta;
