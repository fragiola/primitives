import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Publish a post",
    description:
        "A button that stays focusable while it is busy, so the keyboard keeps its place, and a span that behaves as a button: Enter and Space press it, and it leaves the tab order while disabled.",
    category: "forms",
    order: 12,
    features: ["Button", "focusableWhenDisabled", "nativeButton", "render"],
    docs: "/docs/api/button",
    height: 200,
} satisfies ExampleMeta;
