import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Quick settings",
    description:
        "Three switches named by their labels: a click, Space or Enter turns the focused one on or off, and the disabled one ignores them; the thumb moves with the checked state.",
    category: "forms",
    order: 9,
    features: ["Switch.Root", "Switch.Thumb", "defaultChecked", "disabled"],
    docs: "/docs/api/switch",
    height: 240,
} satisfies ExampleMeta;
