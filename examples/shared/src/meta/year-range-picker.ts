import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Year range filter",
    description:
        "A year range picker filtering a list: two years of a page of twelve set the range, the list keeps the films released in it, and Clear shows them all again.",
    category: "dates",
    order: 10,
    features: [
        "YearRangePicker.Root",
        "YearRangePicker.Trigger",
        "YearRangeCalendar.Root",
        "YearRangeCalendar.Grid",
        "YearRangeCalendar.Cell",
    ],
    docs: "/docs/api/year-range-picker",
    height: 480,
} satisfies ExampleMeta;
