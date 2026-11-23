import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Results pager",
    description:
        "A table of 42 orders shown five at a time, and the Pagination under it: Previous and Next disabled at the ends, the current page marked with aria-current, ellipses for the pages left out.",
    category: "navigation",
    order: 3,
    features: [
        "Pagination.Root",
        "Pagination.Item",
        "Pagination.Ellipsis",
        "Pagination.Previous",
        "Pagination.Next",
        "total",
        "pageSize",
        "onPageChange",
    ],
    docs: "/docs/api/pagination",
    height: 360,
} satisfies ExampleMeta;
