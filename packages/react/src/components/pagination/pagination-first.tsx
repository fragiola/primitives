import {
    type PaginationControlProps,
    usePaginationControl,
} from "./pagination-control.tsx";

/** The first page's control (spec/pagination.md). */
export function PaginationFirst(props: PaginationControlProps) {
    return usePaginationControl("first", "Pagination.First", props);
}
