import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Notifications",
    description:
        "A non-modal popover with an arrow: focus moves to its first button, Tab leaves it and closes it, Escape returns focus to the trigger.",
    category: "overlays",
    order: 2,
    features: [
        "Popover.Root",
        "Popover.Trigger",
        "Popover.Portal",
        "Popover.Positioner",
        "Popover.Popup",
        "Popover.Arrow",
        "Popover.Title",
        "Popover.Description",
        "Popover.Close",
        "sideOffset",
    ],
    docs: "/docs/api/popover",
    height: 360,
} satisfies ExampleMeta;
