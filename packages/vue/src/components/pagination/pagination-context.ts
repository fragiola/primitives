import type { InjectionKey } from "vue";
import type { ChangeDetails } from "../../utils/change-details.ts";

/** What the Root renders with (spec/pagination.md). */
export interface PaginationState {
    /** The current page, from 1. */
    page: number;
    /** The number of pages. */
    count: number;
    disabled: boolean;
}

export interface PaginationContext {
    state: () => PaginationState;
    setPage: (page: number, details: ChangeDetails) => void;
}

export const PaginationKey: InjectionKey<PaginationContext> =
    Symbol("Pagination");
