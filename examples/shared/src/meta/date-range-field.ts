import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Stay dates",
    description:
        "A booking range typed in parts: the check-in date, then the check-out date, the typing moving on from one to the other; a day in the past or a check-out before the check-in is invalid, and the field submits both dates.",
    category: "dates",
    order: 5,
    features: [
        "DateRangeField.Root",
        "DateRangeField.Input",
        "DateRangeField.Segment",
        "min",
        "startName",
        "endName",
        "required",
        "Field.Root",
    ],
    docs: "/docs/api/date-range-field",
    height: 280,
} satisfies ExampleMeta;
