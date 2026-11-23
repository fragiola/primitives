import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Transfer list",
    description:
        "Two multiple listboxes and the buttons that move the selected toppings between them: Space toggles, Shift with the arrows or a press selects a range, Ctrl+A selects them all.",
    category: "forms",
    order: 7,
    features: [
        "Listbox.Root",
        "Listbox.Item",
        "Listbox.ItemIndicator",
        "multiple",
        "value",
        "onValueChange",
    ],
    docs: "/docs/api/listbox",
    height: 360,
} satisfies ExampleMeta;
