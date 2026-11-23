/**
 * The grid of a month or year calendar (spec/month-calendar.md): a page of 12 items (the months
 * of a year, or 12 years starting at a multiple of 12), in rows of `columns`. Items are numbers:
 * a month's `monthIndex`, or the year.
 */
export const UNIT_PAGE_SIZE = 12;

/** The first item of the page holding `index` (January of its year; 2016 for 2026). */
export function unitPageStart(index: number): number {
    return Math.floor(index / UNIT_PAGE_SIZE) * UNIT_PAGE_SIZE;
}

/** The page starting at `start`, in rows of `columns` items. */
export function unitRows(start: number, columns: number): number[][] {
    const size = Math.max(1, Math.floor(columns));
    const rows: number[][] = [];
    for (let offset = 0; offset < UNIT_PAGE_SIZE; offset += size) {
        rows.push(
            Array.from(
                { length: Math.min(size, UNIT_PAGE_SIZE - offset) },
                (_, column) => start + offset + column,
            ),
        );
    }
    return rows;
}

export interface UnitKeyOptions {
    rtl: boolean;
    /** Items per row. */
    columns: number;
}

/**
 * The item a key moves the focused item to in a month or year grid (spec/month-calendar.md,
 * "Keyboard": the Calendar's keys mapped to the grid), or `null` when the key does not move it.
 */
export function unitKeyTarget(
    key: string,
    focused: number,
    { rtl, columns }: UnitKeyOptions,
): number | null {
    const size = Math.max(1, Math.floor(columns));
    const page = unitPageStart(focused);
    const rowStart = page + Math.floor((focused - page) / size) * size;
    switch (key) {
        case "ArrowRight":
            return focused + (rtl ? -1 : 1);
        case "ArrowLeft":
            return focused + (rtl ? 1 : -1);
        case "ArrowDown":
            return focused + size;
        case "ArrowUp":
            return focused - size;
        case "Home":
            return rowStart;
        case "End":
            return Math.min(rowStart + size, page + UNIT_PAGE_SIZE) - 1;
        case "PageDown":
            return focused + UNIT_PAGE_SIZE;
        case "PageUp":
            return focused - UNIT_PAGE_SIZE;
        default:
            return null;
    }
}
