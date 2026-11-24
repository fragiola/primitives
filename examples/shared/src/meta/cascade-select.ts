import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Region and city picker",
    description:
        "A city chosen through its region and country: one list per level, Right or a hover opens the next one, Left goes back, Enter chooses a city; the Field shows an error when nothing is chosen, and the form submits the path.",
    category: "forms",
    order: 29,
    features: [
        "CascadeSelect.Root",
        "CascadeSelect.Trigger",
        "CascadeSelect.Value",
        "CascadeSelect.Popup",
        "CascadeSelect.Level",
        "CascadeSelect.Item",
        "CascadeSelect.ItemIndicator",
        "Field.Root",
        "Field.Error",
        "required",
    ],
    docs: "/docs/api/cascade-select",
    height: 400,
} satisfies ExampleMeta;
