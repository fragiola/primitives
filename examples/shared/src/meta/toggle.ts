import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Track actions",
    description:
        "Toggle buttons on a track: a controlled Favourite, a Mute pressed at first and a disabled Download; a click, Enter or Space presses and releases one, and its name never changes with the state.",
    category: "forms",
    order: 11,
    features: [
        "Toggle",
        "pressed",
        "onPressedChange",
        "defaultPressed",
        "disabled",
        "data-pressed",
    ],
    docs: "/docs/api/toggle",
    height: 240,
} satisfies ExampleMeta;
