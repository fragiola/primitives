import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "View switcher",
    description:
        "A SegmentedControl that lays out a set of projects as a list, a grid or a board: one tab stop, every arrow moves and checks the next view, and the Indicator slides under the checked segment.",
    category: "forms",
    order: 22,
    features: [
        "SegmentedControl.Root",
        "SegmentedControl.Item",
        "SegmentedControl.ItemText",
        "SegmentedControl.Indicator",
        "value",
        "onValueChange",
        "aria-labelledby",
    ],
    docs: "/docs/api/segmented-control",
    height: 340,
} satisfies ExampleMeta;
