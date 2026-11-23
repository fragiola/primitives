import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Profile preview",
    description:
        "A user's card on a link: hover or keyboard focus shows it after a delay, the pointer can cross over to it, and the link still leads to the profile.",
    category: "overlays",
    order: 11,
    features: [
        "HoverCard.Root",
        "HoverCard.Trigger",
        "HoverCard.Portal",
        "HoverCard.Positioner",
        "HoverCard.Popup",
        "HoverCard.Arrow",
        "delay",
        "closeDelay",
    ],
    docs: "/docs/api/hover-card",
    height: 320,
} satisfies ExampleMeta;
