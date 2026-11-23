import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Create an account",
    description:
        "A form that validates its fields on submit and focuses the first invalid one, then shows the server's answer on the field it names; typing in that field clears it.",
    category: "forms",
    order: 9,
    features: ["Form", "errors", "onClearErrors", "Field.Root", "Field.Error"],
    docs: "/docs/api/form",
    height: 380,
} satisfies ExampleMeta;
