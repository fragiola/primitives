import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Report period",
    description:
        "A date range picker with presets: the last 7 or 30 days and this month set the range in one press and close the popup, or two days of the calendar choose any other period.",
    category: "dates",
    order: 8,
    features: [
        "CalendarPreset",
        "DateRangePicker.Root",
        "DateRangePicker.Trigger",
        "RangeCalendar.Root",
        "max",
    ],
    docs: "/docs/api/calendar-preset",
    height: 520,
} satisfies ExampleMeta;
