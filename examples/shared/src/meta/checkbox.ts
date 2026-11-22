import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Pizza toppings",
    description:
        "A CheckboxGroup with a parent checkbox: it checks or clears every topping and shows the mixed state in between; Space toggles the focused checkbox.",
    category: "forms",
    order: 2,
    features: [
        "Checkbox.Root",
        "Checkbox.Indicator",
        "CheckboxGroup",
        "parent",
        "allValues",
        "indeterminate",
    ],
    docs: "/docs/api/checkbox",
    height: 320,
} satisfies ExampleMeta;
