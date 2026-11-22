import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Booking form",
    description:
        "A date picker in a form: the trigger opens a calendar on today, past days are disabled, choosing a day closes it and returns focus to the trigger, and a hidden input submits the day.",
    category: "dates",
    order: 1,
    features: [
        "DatePicker.Root",
        "DatePicker.Trigger",
        "DatePicker.Portal",
        "DatePicker.Positioner",
        "DatePicker.Popup",
        "Calendar.Root",
        "Calendar.Grid",
        "Calendar.Cell",
        "min",
    ],
    docs: "/docs/api/date-picker",
    height: 460,
} satisfies ExampleMeta;
