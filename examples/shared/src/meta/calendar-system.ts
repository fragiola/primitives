import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Persian calendar",
    description:
        "A calendar and a date field in the Persian calendar, right to left in fa-IR: the grid shows the Persian months, the field types the Persian year, month and day, and both share one ISO date.",
    category: "dates",
    order: 11,
    features: [
        "Calendar.Root",
        "calendar",
        "DateField.Root",
        "locale",
        "Field.Root",
    ],
    docs: "/docs/api/calendar",
    height: 520,
} satisfies ExampleMeta;
