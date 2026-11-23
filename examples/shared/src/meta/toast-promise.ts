import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Upload progress",
    description:
        "A promise toast: it says the upload is running while it runs, then shows its result, announced, and closes after its timeout.",
    category: "overlays",
    order: 13,
    features: [
        "useToastManager",
        "promise",
        "Toast.Root",
        "Toast.Title",
        "Toast.Description",
        "Toast.Close",
        "timeout",
    ],
    docs: "/docs/api/toast",
    height: 360,
} satisfies ExampleMeta;
