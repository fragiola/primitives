import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "App menu bar",
    description:
        "An application's File, Edit and View menus in one bar, one tab stop: the arrow keys move between the menus and, once one is open, the arrows and the pointer switch menus; File has a submenu, View checkbox and radio items.",
    category: "overlays",
    order: 10,
    features: [
        "Menubar",
        "Menu.Root",
        "Menu.Trigger",
        "Menu.SubmenuRoot",
        "Menu.CheckboxItem",
        "Menu.RadioGroup",
        "Menu.RadioItem",
        "hover switching",
    ],
    docs: "/docs/api/menubar",
    height: 360,
} satisfies ExampleMeta;
