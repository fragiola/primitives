import {
    type PaginationControlProps,
    usePaginationControl,
} from "./pagination-control.tsx";

export type PaginationLastProps = PaginationControlProps;

/** The last page's control (spec/pagination.md). */
export function PaginationLast(props: PaginationLastProps) {
    return usePaginationControl("last", "Pagination.Last", props);
}
