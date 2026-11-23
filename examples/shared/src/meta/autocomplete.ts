import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Search suggestions",
    description:
        "A search field whose suggestions follow the text: the arrows highlight one, Enter or a click fills it in, any other text is searched as typed, and Escape closes the list, then clears the text.",
    category: "forms",
    order: 6,
    features: [
        "Autocomplete.Root",
        "Autocomplete.InputGroup",
        "Autocomplete.Input",
        "Autocomplete.Clear",
        "Autocomplete.List",
        "Autocomplete.Item",
        "Autocomplete.Empty",
        "items",
        "mode",
    ],
    docs: "/docs/api/autocomplete",
    height: 380,
} satisfies ExampleMeta;
