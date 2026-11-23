import {
    clampPage,
    type PaginationItem,
    pageCount,
    paginationRange,
} from "@fragiola/primitives/pagination";
import { type ReactNode, useMemo } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    PaginationContext,
    type PaginationState,
} from "./pagination-context.ts";

/** What the Root's children function receives. */
export interface PaginationRenderProps {
    /** The range, in order: pages and ellipses. */
    items: PaginationItem[];
    page: number;
    count: number;
}

export interface PaginationRootProps
    extends Omit<PartProps<PaginationState>, "children"> {
    /** The current page, from 1 (controlled). */
    page?: number;
    /** The page at first (default `1`). */
    defaultPage?: number;
    /** Every page change, with its reason. */
    onPageChange?: (page: number, details: ChangeDetails) => void;
    /** The number of pages; or `total` and `pageSize`. */
    count?: number;
    /** The number of rows, with `pageSize`, when `count` is not given. */
    total?: number;
    /** The rows per page (default `10`). */
    pageSize?: number;
    /** The pages shown on each side of the current one (default `1`). */
    siblingCount?: number;
    /** The pages always shown at each end (default `1`). */
    boundaryCount?: number;
    /** Every control is disabled. */
    disabled?: boolean;
    /** The Items and Ellipses: a node, or a function of the range. */
    children?: ReactNode | ((props: PaginationRenderProps) => ReactNode);
}

/**
 * The `nav` landmark of a paged list (spec/pagination.md): it holds the page and the range its
 * children render as Items and Ellipses. The app names it (`aria-label`).
 */
export function PaginationRoot({
    page: pageProp,
    defaultPage = 1,
    onPageChange,
    count: countProp,
    total,
    pageSize,
    siblingCount,
    boundaryCount,
    disabled = false,
    children,
    ...props
}: PaginationRootProps) {
    const count = pageCount({ count: countProp, total, pageSize });
    const [own, setOwn] = useControllableState(
        pageProp,
        defaultPage,
        onPageChange,
    );
    const page = clampPage(own, count);
    const items = useMemo(
        () => paginationRange({ page, count, siblingCount, boundaryCount }),
        [page, count, siblingCount, boundaryCount],
    );
    const context = useMemo(
        () => ({
            page,
            count,
            disabled,
            setPage: (next: number, details: ChangeDetails) => {
                const target = clampPage(next, count);
                if (target !== page) {
                    setOwn(target, details);
                }
            },
        }),
        [page, count, disabled, setOwn],
    );
    const state: PaginationState = { page, count, disabled };
    return (
        <PaginationContext.Provider value={context}>
            {renderElement(
                "nav",
                {
                    ...props,
                    children:
                        typeof children === "function"
                            ? children({ items, page, count })
                            : children,
                },
                state,
                {
                    "data-primitives-part": "pagination-root",
                    ...stateAttributes({ disabled }),
                },
            )}
        </PaginationContext.Provider>
    );
}
