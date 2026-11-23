import {
    type PaginationControlProps,
    usePaginationControl,
} from "./pagination-control.tsx";

/** The last page's control (spec/pagination.md). */
export function PaginationLast(props: PaginationControlProps) {
    return usePaginationControl("last", "Pagination.Last", props);
}
