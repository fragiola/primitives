import {
    type PaginationControlProps,
    usePaginationControl,
} from "./pagination-control.tsx";

export type PaginationPreviousProps = PaginationControlProps;

/** The previous page's control (spec/pagination.md). */
export function PaginationPrevious(props: PaginationPreviousProps) {
    return usePaginationControl("previous", "Pagination.Previous", props);
}
