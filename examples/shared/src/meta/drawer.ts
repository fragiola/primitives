import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Share sheet",
    description:
        "A bottom sheet: it slides up from the edge, a swipe down (with a mouse from its handle, or a touch anywhere) or Escape closes it, and choosing a target shares the page.",
    category: "overlays",
    order: 8,
    features: [
        "Drawer.Root",
        "Drawer.Trigger",
        "Drawer.Portal",
        "Drawer.Backdrop",
        "Drawer.Popup",
        "Drawer.Content",
        "Drawer.Title",
        "Drawer.Description",
        "Drawer.Close",
        "swipeDirection",
    ],
    docs: "/docs/api/drawer",
    height: 420,
} satisfies ExampleMeta;
