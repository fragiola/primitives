import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Contact settings",
    description:
        "A Form with a required RadioGroup and a Switch, each in a Field: the arrows move through the radios and check them, Space toggles the switch, and saving with no channel chosen focuses the first radio and shows the error.",
    category: "forms",
    order: 8,
    features: [
        "RadioGroup",
        "Radio.Root",
        "Radio.Indicator",
        "Switch.Root",
        "uncheckedValue",
        "Field.Root",
        "Form",
    ],
    docs: "/docs/api/radio-group",
    height: 400,
} satisfies ExampleMeta;
