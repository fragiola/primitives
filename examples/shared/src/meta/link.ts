import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Docs navigation",
    description:
        "A sidebar of Links rendered through the framework's own router: the current page marked with aria-current, a disabled page that stays in the tab order and navigates nowhere.",
    category: "navigation",
    order: 4,
    features: ["Link", "render / as (a router link)", "current", "disabled"],
    docs: "/docs/api/link",
    height: 280,
} satisfies ExampleMeta;
