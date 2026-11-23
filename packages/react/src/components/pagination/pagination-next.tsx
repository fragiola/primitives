import {
    type PaginationControlProps,
    usePaginationControl,
} from "./pagination-control.tsx";

export type PaginationNextProps = PaginationControlProps;

/** The next page's control (spec/pagination.md). */
export function PaginationNext(props: PaginationNextProps) {
    return usePaginationControl("next", "Pagination.Next", props);
}
