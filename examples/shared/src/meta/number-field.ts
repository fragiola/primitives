import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Quantity field",
    description:
        "A quantity between 1 and 10 named by a Label, stepped by its buttons (held, they repeat), the arrows and Page Up and Down, or typed; and a discount written as a percentage whose label is a scrub area.",
    category: "forms",
    order: 18,
    features: [
        "NumberField.Root",
        "NumberField.Group",
        "NumberField.Input",
        "NumberField.Increment",
        "NumberField.Decrement",
        "NumberField.ScrubArea",
        "Label",
        "format",
        "min",
        "max",
    ],
    docs: "/docs/api/number-field",
    height: 300,
} satisfies ExampleMeta;
