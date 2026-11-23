import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Meeting time",
    description:
        "A meeting time typed in parts, hour, minutes and AM or PM: the day period takes its first letter or the arrows, office hours bound it, and the field submits the ISO time.",
    category: "dates",
    order: 4,
    features: [
        "TimeField.Root",
        "TimeField.Input",
        "TimeField.Segment",
        "min",
        "max",
        "required",
        "Field.Root",
    ],
    docs: "/docs/api/time-field",
    height: 280,
} satisfies ExampleMeta;
