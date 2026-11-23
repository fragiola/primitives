import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Departure date",
    description:
        "A date picker you can also type into: the segments take the date, the button opens the calendar on it, and choosing a day fills the segments; a typed date before today is refused, and the picker submits the day.",
    category: "dates",
    order: 6,
    features: [
        "DatePickerInput.Root",
        "DatePickerInput.Segments",
        "DatePickerInput.Segment",
        "DatePicker.Trigger",
        "Calendar.Root",
        "min",
        "required",
        "Field.Root",
    ],
    docs: "/docs/api/date-picker-input",
    height: 460,
} satisfies ExampleMeta;
