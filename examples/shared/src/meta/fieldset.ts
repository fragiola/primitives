import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Shipping and billing",
    description:
        "Two address fieldsets, each named by its legend: the billing one stays disabled, with every field inside it, while billing is the same as shipping.",
    category: "forms",
    order: 10,
    features: ["Fieldset.Root", "Fieldset.Legend", "disabled", "Field.Root"],
    docs: "/docs/api/fieldset",
    height: 440,
} satisfies ExampleMeta;
