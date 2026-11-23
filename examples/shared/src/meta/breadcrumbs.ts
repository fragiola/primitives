import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Router-linked breadcrumb",
    description:
        "A trail built from the router's current path: each parent page a Breadcrumbs.Link rendered through the router, the current page a Breadcrumbs.Current, slashes between them.",
    category: "navigation",
    order: 5,
    features: [
        "Breadcrumbs.Root",
        "Breadcrumbs.List",
        "Breadcrumbs.Link",
        "Breadcrumbs.Current",
        "Breadcrumbs.Separator",
    ],
    docs: "/docs/api/breadcrumbs",
    height: 280,
} satisfies ExampleMeta;
