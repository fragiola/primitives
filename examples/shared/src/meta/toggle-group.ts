import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Text alignment",
    description:
        "A ToggleGroup of four alignments, one pressed at a time, applied to a paragraph: the group is one tab stop, the arrow keys move between the toggles, and pressing the pressed one releases it.",
    category: "forms",
    order: 12,
    features: [
        "ToggleGroup",
        "Toggle",
        "value",
        "onValueChange",
        "aria-label",
        "roving focus",
    ],
    docs: "/docs/api/toggle-group",
    height: 260,
} satisfies ExampleMeta;
