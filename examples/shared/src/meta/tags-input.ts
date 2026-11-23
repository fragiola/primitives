import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Email recipients",
    description:
        "A TagsInput of email addresses: Enter, a comma or a paste adds them, a text that is no address or is already there is refused and explained, Backspace reaches the last recipient, a double press edits one, and leaving the field adds what was typed.",
    category: "forms",
    order: 21,
    features: [
        "TagsInput.Root",
        "TagsInput.Control",
        "TagsInput.Input",
        "TagsInput.Tag",
        "TagsInput.TagText",
        "TagsInput.TagRemove",
        "TagsInput.TagInput",
        "TagsInput.ClearTrigger",
        "validate",
        "onValueInvalid",
        "editable",
        "blurBehavior",
    ],
    docs: "/docs/api/tags-input",
    height: 300,
} satisfies ExampleMeta;
