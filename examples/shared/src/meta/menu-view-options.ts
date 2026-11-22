import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "View options",
    description:
        "A menu of checkbox and radio items: Space toggles or checks and keeps the menu open, Enter does it and closes the menu, and a click keeps it open.",
    category: "overlays",
    order: 6,
    features: [
        "Menu.CheckboxItem",
        "Menu.CheckboxItemIndicator",
        "Menu.RadioGroup",
        "Menu.RadioItem",
        "Menu.RadioItemIndicator",
        "Menu.Group",
        "Menu.GroupLabel",
        "checked",
        "value",
    ],
    docs: "/docs/api/menu",
    height: 360,
} satisfies ExampleMeta;
