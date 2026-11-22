import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Fruit picker",
    description:
        "A select-only combobox: focus stays on the trigger, typing on it opens the list on the matching fruit, Enter or Tab chooses, and a disabled fruit cannot be chosen.",
    category: "forms",
    order: 4,
    features: [
        "Select.Root",
        "Select.Trigger",
        "Select.Value",
        "Select.Portal",
        "Select.Positioner",
        "Select.Popup",
        "Select.List",
        "Select.Item",
        "Select.ItemIndicator",
        "disabled",
    ],
    docs: "/docs/api/select",
    height: 380,
} satisfies ExampleMeta;
