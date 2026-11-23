import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Async user search",
    description:
        "A Combobox that searches a directory of 2 000 users as you type: each page loads after a delay, a newer search replaces a slower one, and scrolling to the end of the list loads the next page.",
    category: "forms",
    order: 9,
    features: [
        "ComboboxVirtual.List",
        "async-list",
        "loading",
        "onLoadMore",
        "Combobox.Root",
        "Combobox.Input",
        "Combobox.Status",
        "Combobox.Empty",
        "Combobox.Item",
        "filter",
    ],
    docs: "/docs/api/combobox-virtual",
    height: 480,
} satisfies ExampleMeta;
