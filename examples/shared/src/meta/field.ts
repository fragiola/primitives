import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Sign-up email",
    description:
        "An email field in a form: the label and the description are wired to the input, and a submission with an empty or malformed address shows the matching error and focuses it.",
    category: "forms",
    order: 1,
    features: [
        "Field.Root",
        "Field.Label",
        "Field.Control",
        "Field.Description",
        "Field.Error",
        "match",
        "form validation",
    ],
    docs: "/docs/api/field",
    height: 320,
} satisfies ExampleMeta;
