import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Notification stack",
    description:
        "Notifications from a queue a plain module holds: they stack, pause while hovered or focused, close by themselves, and are reached with F6.",
    category: "overlays",
    order: 12,
    features: [
        "createToastManager",
        "Toast.Provider",
        "Toast.Viewport",
        "Toast.Root",
        "Toast.Title",
        "Toast.Description",
        "Toast.Action",
        "Toast.Close",
        "priority",
    ],
    docs: "/docs/api/toast",
    height: 360,
} satisfies ExampleMeta;
