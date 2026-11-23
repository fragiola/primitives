import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Birth date",
    description:
        "A birth date typed in parts, month, day and year, each a spinbutton: digits fill a part and move on, the arrows step it, a date after today is invalid, and saving with none shows the error.",
    category: "dates",
    order: 3,
    features: [
        "DateField.Root",
        "DateField.Input",
        "DateField.Segment",
        "max",
        "name",
        "required",
        "Field.Root",
    ],
    docs: "/docs/api/date-field",
    height: 260,
} satisfies ExampleMeta;
