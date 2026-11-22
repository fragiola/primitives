import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Settings tabs",
    description:
        "Account settings in tabs: the arrow keys move between tabs, a disabled tab stays focusable, an indicator follows the selection, and the panels slide in from the side the selection moved to.",
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
        "data-activation-direction",
    ],
    docs: "/docs/api/tabs",
    height: 320,
} satisfies ExampleMeta;
