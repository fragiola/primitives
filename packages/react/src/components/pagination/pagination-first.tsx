import {
    type PaginationControlProps,
    usePaginationControl,
} from "./pagination-control.tsx";

export type PaginationFirstProps = PaginationControlProps;

/** The first page's control (spec/pagination.md). */
export function PaginationFirst(props: PaginationFirstProps) {
    return usePaginationControl("first", "Pagination.First", props);
}
