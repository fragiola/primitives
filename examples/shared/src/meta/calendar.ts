import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Trip dates",
    description:
        "A range calendar over two months: the first day chosen is the check-in, hovering previews the stay, the second is the check-out, and Escape cancels a started stay.",
    category: "dates",
    order: 2,
    features: [
        "RangeCalendar.Root",
        "RangeCalendar.Heading",
        "RangeCalendar.PrevButton",
        "RangeCalendar.NextButton",
        "RangeCalendar.Grid",
        "RangeCalendar.Cell",
        "visibleMonths",
    ],
    docs: "/docs/api/range-calendar",
    height: 440,
} satisfies ExampleMeta;
