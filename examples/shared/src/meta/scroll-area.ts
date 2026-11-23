import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Sidebar channels",
    description:
        "A sidebar of forty channel links in a ScrollArea: the list scrolls natively (wheel, touch, Tab into a link), and the custom scrollbar's thumb follows it, drags and jumps to a press on its track.",
    category: "display",
    order: 5,
    features: [
        "ScrollArea.Root",
        "ScrollArea.Viewport",
        "ScrollArea.Content",
        "ScrollArea.Scrollbar",
        "ScrollArea.Thumb",
        "data-hovering",
        "data-overflow-y-end",
    ],
    docs: "/docs/api/scroll-area",
    height: 320,
} satisfies ExampleMeta;
