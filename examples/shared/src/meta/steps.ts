import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Checkout stepper",
    description:
        "Three linear steps, Shipping, Payment and Review: Continue and the later steps wait until the shipping name is filled in, and the last Continue places the order.",
    category: "navigation",
    order: 6,
    features: [
        "Steps.List",
        "Steps.Trigger",
        "Steps.Indicator",
        "Steps.Content",
        "Steps.CompletedContent",
        "linear",
        "isStepValid",
    ],
    docs: "/docs/api/steps",
    height: 400,
} satisfies ExampleMeta;
