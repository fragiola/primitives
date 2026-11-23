import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Product search",
    description:
        "A search box that filters a short product list as you type: Escape or the clear button empties it, and Enter searches for the query.",
    category: "forms",
    order: 25,
    features: [
        "SearchField.Root",
        "SearchField.Input",
        "SearchField.ClearButton",
        "onSubmit",
        "data-empty",
    ],
    docs: "/docs/api/search-field",
    height: 320,
} satisfies ExampleMeta;
