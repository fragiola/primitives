import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Meeting across time zones",
    description:
        "A meeting typed in New York time, with the zone's name in the field: London and Kolkata show the same instant, and a date after the clocks change keeps 9:00 in New York while the other zones move.",
    category: "dates",
    order: 12,
    features: [
        "DateField.Root",
        "timeZone",
        "granularity",
        "toTimeZone",
        "toIsoZoned",
        "Field.Root",
    ],
    docs: "/docs/api/date-field",
    height: 360,
} satisfies ExampleMeta;
