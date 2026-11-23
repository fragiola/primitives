import { PaginationEllipsis } from "./pagination-ellipsis.ts";
import { PaginationFirst } from "./pagination-first.ts";
import { PaginationItem } from "./pagination-item.ts";
import { PaginationLast } from "./pagination-last.ts";
import { PaginationNext } from "./pagination-next.ts";
import { PaginationPrevious } from "./pagination-previous.ts";
import { PaginationRoot } from "./pagination-root.ts";

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
