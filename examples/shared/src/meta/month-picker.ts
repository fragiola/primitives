import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Card expiry",
    description:
        "A required month picker in a field: the popup holds the months of a year, the past months are disabled, and the picker submits the month as 2026-11; saving with no month shows the error.",
    category: "dates",
    order: 9,
    features: [
        "MonthPicker.Root",
        "MonthPicker.Trigger",
        "MonthCalendar.Root",
        "MonthCalendar.Grid",
        "MonthCalendar.Cell",
        "min",
        "name",
        "required",
        "Field.Root",
    ],
    docs: "/docs/api/month-picker",
    height: 420,
} satisfies ExampleMeta;
