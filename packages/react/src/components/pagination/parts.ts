import { PaginationEllipsis } from "./pagination-ellipsis.tsx";
import { PaginationFirst } from "./pagination-first.tsx";
import { PaginationItem } from "./pagination-item.tsx";
import { PaginationLast } from "./pagination-last.tsx";
import { PaginationNext } from "./pagination-next.tsx";
import { PaginationPrevious } from "./pagination-previous.tsx";
import { PaginationRoot } from "./pagination-root.tsx";

/** spec/pagination.md */
export const Pagination = {
    Root: PaginationRoot,
    Item: PaginationItem,
    Ellipsis: PaginationEllipsis,
    Previous: PaginationPrevious,
    Next: PaginationNext,
    First: PaginationFirst,
    Last: PaginationLast,
};
