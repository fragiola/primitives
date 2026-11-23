import {
    type PaginationControlProps,
    usePaginationControl,
} from "./pagination-control.tsx";

/** The next page's control (spec/pagination.md). */
export function PaginationNext(props: PaginationControlProps) {
    return usePaginationControl("next", "Pagination.Next", props);
}
