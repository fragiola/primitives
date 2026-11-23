import { createContext } from "react";
import type { ChangeDetails } from "../../utils/change-details.ts";

/** What the Root renders with (spec/pagination.md). */
export interface PaginationState {
    /** The current page, from 1. */
    page: number;
    /** The number of pages. */
    count: number;
    disabled: boolean;
}

export interface PaginationContextValue extends PaginationState {
    setPage: (page: number, details: ChangeDetails) => void;
}

export const PaginationContext = createContext<PaginationContextValue | null>(
    null,
);
