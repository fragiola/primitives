/** One item of a pagination's range (spec/pagination.md, "The range"). */
export type PaginationItem =
    | { type: "page"; value: number }
    | { type: "ellipsis"; position: "start" | "end" };

export interface PaginationRangeOptions {
    /** The current page, from 1 (clamped to `[1, count]`). */
    page: number;
    /** The number of pages (at least 1). */
    count: number;
    /** The pages shown on each side of the current one (default `1`). */
    siblingCount?: number | undefined;
    /** The pages always shown at each end (default `1`). */
    boundaryCount?: number | undefined;
}

export interface PageCountOptions {
    /** The number of pages, when known. */
    count?: number | undefined;
    /** Else the number of rows... */
    total?: number | undefined;
    /** ...and the rows per page (default `10`). */
    pageSize?: number | undefined;
}

/** A whole number at least `min`, or `fallback` for a value that is no finite number. */
function whole(value: number | undefined, min: number, fallback: number) {
    return value === undefined || !Number.isFinite(value)
        ? fallback
        : Math.max(min, Math.floor(value));
}

/** The number of pages: `count`, or `ceil(total / pageSize)`; never less than 1. */
export function pageCount({
    count,
    total,
    pageSize,
}: PageCountOptions): number {
    if (count !== undefined) {
        return whole(count, 1, 1);
    }
    const rows = whole(total, 0, 0);
    const size = whole(pageSize, 1, 10);
    return Math.max(1, Math.ceil(rows / size));
}

/** A page clamped to `[1, count]` (a value that is no finite number is 1). */
export function clampPage(page: number, count: number): number {
    return Math.min(Math.max(1, Math.floor(count)), whole(page, 1, 1));
}

/**
 * The items of a pagination: every page when they fit in `2 × boundary + 2 × siblings + 3`
 * items, else the boundary pages, a slot, the window around the current page (kept whole near
 * the ends), a slot and the boundary pages; a slot is an ellipsis, or the single page it would
 * hide.
 */
export function paginationRange({
    page,
    count,
    siblingCount,
    boundaryCount,
}: PaginationRangeOptions): PaginationItem[] {
    const pages = Math.max(1, Math.floor(count));
    const current = clampPage(page, pages);
    const siblings = whole(siblingCount, 0, 1);
    const boundary = whole(boundaryCount, 0, 1);
    const pageItem = (value: number): PaginationItem => ({
        type: "page",
        value,
    });
    if (pages <= 2 * boundary + 2 * siblings + 3) {
        return Array.from({ length: pages }, (_, index) => pageItem(index + 1));
    }
    // the window keeps its 2 × siblings + 1 pages, sliding inward at the ends
    const start = Math.min(
        Math.max(current - siblings, boundary + 2),
        pages - boundary - 1 - 2 * siblings,
    );
    const end = start + 2 * siblings;
    const items: PaginationItem[] = [];
    for (let value = 1; value <= boundary; value++) {
        items.push(pageItem(value));
    }
    items.push(
        start === boundary + 2
            ? pageItem(boundary + 1)
            : { type: "ellipsis", position: "start" },
    );
    for (let value = start; value <= end; value++) {
        items.push(pageItem(value));
    }
    items.push(
        end === pages - boundary - 1
            ? pageItem(pages - boundary)
            : { type: "ellipsis", position: "end" },
    );
    for (let value = pages - boundary + 1; value <= pages; value++) {
        items.push(pageItem(value));
    }
    return items;
}
