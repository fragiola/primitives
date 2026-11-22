import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "File manager",
    description:
        "A context menu on a list of files: a right-click opens it at the pointer, a long press on a touch screen or Shift+F10 too, and its Share submenu works as a menu's.",
    category: "overlays",
    order: 7,
    features: [
        "ContextMenu.Root",
        "ContextMenu.Trigger",
        "ContextMenu.Portal",
        "ContextMenu.Positioner",
        "ContextMenu.Popup",
        "ContextMenu.Item",
        "ContextMenu.Separator",
        "ContextMenu.SubmenuRoot",
        "ContextMenu.SubmenuTrigger",
    ],
    docs: "/docs/api/context-menu",
    height: 380,
} satisfies ExampleMeta;
