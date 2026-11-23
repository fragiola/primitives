import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Availability",
    description:
        "A calendar of several dates: press the days you are available, up to five, from today on; pressing a day again removes it, and the form submits one entry per day.",
    category: "dates",
    order: 7,
    features: [
        "MultipleCalendar.Root",
        "MultipleCalendar.Grid",
        "MultipleCalendar.Cell",
        "maxSelected",
        "min",
        "name",
    ],
    docs: "/docs/api/multiple-calendar",
    height: 460,
} satisfies ExampleMeta;
