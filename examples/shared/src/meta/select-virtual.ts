import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Country list of thousands",
    description:
        "A Select over 5 000 countries whose list renders only the rows in view: the arrows, Home and End and the typeahead reach every country, rendered or not, and each option keeps its place in the set.",
    category: "forms",
    order: 8,
    features: [
        "SelectVirtual.List",
        "Select.Root",
        "Select.Trigger",
        "Select.Value",
        "Select.Popup",
        "Select.Item",
        "items",
        "aria-setsize",
    ],
    docs: "/docs/api/select-virtual",
    height: 440,
} satisfies ExampleMeta;
