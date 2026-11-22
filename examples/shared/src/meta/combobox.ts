import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Fruit tags",
    description:
        "A multiple combobox with chips: typing filters the list, Enter adds a fruit, Backspace in the empty input removes the last chip, and Escape resets the text.",
    category: "forms",
    order: 5,
    features: [
        "Combobox.Root",
        "Combobox.Chips",
        "Combobox.Chip",
        "Combobox.ChipRemove",
        "Combobox.Value",
        "Combobox.Input",
        "Combobox.List",
        "Combobox.Item",
        "Combobox.Empty",
        "multiple",
        "items",
    ],
    docs: "/docs/api/combobox",
    height: 380,
} satisfies ExampleMeta;
