import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "File menu",
    description:
        "A menu button with a submenu: the arrow keys move through the items, typing jumps to one, ArrowRight opens the submenu and Escape closes one level.",
    category: "overlays",
    order: 4,
    features: [
        "Menu.Root",
        "Menu.Trigger",
        "Menu.Portal",
        "Menu.Positioner",
        "Menu.Popup",
        "Menu.Item",
        "Menu.Separator",
        "Menu.SubmenuRoot",
        "Menu.SubmenuTrigger",
        "disabled",
    ],
    docs: "/docs/api/menu",
    height: 360,
} satisfies ExampleMeta;
