import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Inline-editable title",
    description:
        "A document title edited in place: a focus or the pencil turns it into a field with the text selected, Enter or the check saves it, Escape or the cross puts it back, and the focus returns to the pencil.",
    category: "forms",
    order: 26,
    features: [
        "Editable.Root",
        "Editable.Area",
        "Editable.Preview",
        "Editable.Input",
        "Editable.EditTrigger",
        "Editable.SubmitTrigger",
        "Editable.CancelTrigger",
        "onValueCommit",
        "onValueRevert",
    ],
    docs: "/docs/api/editable",
    height: 240,
} satisfies ExampleMeta;
