import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Cart panel",
    description:
        "A side panel at the right edge: swiped to the right, closed with Escape or its button, and its items removed one by one.",
    category: "overlays",
    order: 9,
    features: [
        "Drawer.Root",
        "Drawer.Trigger",
        "Drawer.Portal",
        "Drawer.Backdrop",
        "Drawer.Popup",
        "Drawer.Title",
        "Drawer.Description",
        "Drawer.Close",
        'swipeDirection="right"',
    ],
    docs: "/docs/api/drawer",
    height: 420,
} satisfies ExampleMeta;
