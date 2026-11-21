import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Settings tabs",
    description:
        "Account settings in tabs: the arrow keys move between tabs, a disabled tab stays focusable, and an indicator follows the selection.",
    category: "navigation",
    order: 1,
    features: [
        "Tabs.Root",
        "Tabs.List",
        "Tabs.Tab",
        "Tabs.Indicator",
        "Tabs.Panel",
        "defaultValue",
        "disabled",
    ],
    docs: "/docs/api/tabs",
    height: 320,
} satisfies ExampleMeta;
