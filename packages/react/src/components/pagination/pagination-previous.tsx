import {
    type PaginationControlProps,
    usePaginationControl,
} from "./pagination-control.tsx";

/** The previous page's control (spec/pagination.md). */
export function PaginationPrevious(props: PaginationControlProps) {
    return usePaginationControl("previous", "Pagination.Previous", props);
}
