import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Filter tags",
    description:
        "A TagGroup of topics that filters a list of articles: the arrows move between the tags, Space and a press select several, Delete, Backspace or a tag's remove button drops it, and the last one removed leaves an empty message.",
    category: "forms",
    order: 20,
    features: [
        "TagGroup.Root",
        "TagGroup.Label",
        "TagGroup.List",
        "TagGroup.Tag",
        "TagGroup.TagCell",
        "TagGroup.RemoveButton",
        "selectionMode",
        "onRemove",
        "data-empty",
    ],
    docs: "/docs/api/tag-group",
    height: 340,
} satisfies ExampleMeta;
