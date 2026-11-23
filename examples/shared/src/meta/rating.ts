import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Product rating",
    description:
        "A read-only average of 4.5 stars, half filled, and the reader's own Rating: the pointer previews a score, a press or the arrows choose it, Home and End reach the ends, and pressing the chosen star again clears it.",
    category: "forms",
    order: 23,
    features: [
        "Rating.Root",
        "Rating.Item",
        "readOnly",
        "allowHalf",
        "allowClear",
        "data-highlighted",
        "data-half",
    ],
    docs: "/docs/api/rating",
    height: 280,
} satisfies ExampleMeta;
