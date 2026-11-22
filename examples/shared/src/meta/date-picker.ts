import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Booking form",
    description:
        "A required date picker in a field: the trigger opens a calendar on today, past days are disabled, choosing a day closes it and returns focus to the trigger, and the picker submits the day; booking with no day shows the error.",
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
        "name",
        "required",
        "Field.Root",
    ],
    docs: "/docs/api/date-picker",
    height: 460,
} satisfies ExampleMeta;
