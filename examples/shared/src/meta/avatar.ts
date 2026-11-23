import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Team avatars",
    description:
        "An image shown only once it has loaded, a broken image that shows its initials instead, and initials with a delay so that a fast image never flashes them; the avatars never shift the layout.",
    category: "display",
    order: 3,
    features: ["Avatar.Root", "Avatar.Image", "Avatar.Fallback", "delay"],
    docs: "/docs/api/avatar",
    height: 200,
} satisfies ExampleMeta;
