/** A rendered row of a virtual list: its index, where it starts, its size and the room before it. */
export interface VirtualRow {
    index: number;
    /** Its offset from the list's first row (the sizes and gaps of every row before it). */
    start: number;
    size: number;
    /**
     * The room between the previous rendered row (or the list's start) and this row that no
     * rendered row fills: the unrendered rows and their gaps. The framework gives it to the row as
     * its `margin-block-start`; the layout's own gap between two rendered rows is not part of it.
     */
    spaceBefore: number;
    /** The group label that sticks to the top of the scroll container (`position: sticky`). */
    sticky: boolean;
}

/** What a virtual list renders: its rows, in order, and the room after the last one. */
export interface VirtualRange {
    rows: readonly VirtualRow[];
    /** The room after the last rendered row: its `margin-block-end`. */
    spaceAfter: number;
    /** The size of every row and gap: the list's full extent. */
    totalSize: number;
    /** The first row in view (the overscan excluded), `-1` when the list is empty. */
    visibleStart: number;
    /** The last row in view (the overscan excluded), `-1` when the list is empty. */
    visibleEnd: number;
}

export interface VirtualLayoutOptions {
    count: number;
    /** A row's size: measured, else estimated. */
    size: (index: number) => number;
    /** The layout's gap between two rows (a flex or grid `row-gap`). */
    gap?: number;
    /** How far the list is scrolled, from its first row. */
    offset: number;
    /** The scroll container's visible size. */
    viewport: number;
    /** The rows rendered beyond each end of the view (default 4). */
    overscan?: number;
    /** Rows always rendered: the focused or highlighted one, the selected one, the ends. */
    pinned?: readonly number[];
    /** The rows that stick while their group is in view (group labels), in order. */
    sticky?: readonly number[];
}

/**
 * Where every row starts: `starts[i]` is row `i`'s offset, `starts[count]` the list's extent. A
 * gap separates two rows (none after the last).
 */
export function rowStarts(
    count: number,
    size: (index: number) => number,
    gap = 0,
): Float64Array {
    const starts = new Float64Array(count + 1);
    for (let index = 0; index < count; index += 1) {
        starts[index + 1] =
            (starts[index] as number) +
            size(index) +
            (index < count - 1 ? gap : 0);
    }
    return starts;
}

/** The row at `offset`: the last one starting at or before it (clamped to the list). */
export function rowAt(starts: Float64Array, offset: number): number {
    const count = starts.length - 1;
    if (count <= 0) {
        return -1;
    }
    let low = 0;
    let high = count - 1;
    while (low < high) {
        const middle = (low + high + 1) >> 1;
        if ((starts[middle] as number) <= offset) {
            low = middle;
        } else {
            high = middle - 1;
        }
    }
    return low;
}

/** The sticky row of the group in view: the last sticky row at or before `first`. */
export function activeSticky(
    sticky: readonly number[],
    first: number,
): number | undefined {
    let active: number | undefined;
    for (const index of sticky) {
        if (index > first) {
            break;
        }
        active = index;
    }
    return active;
}

const EMPTY: VirtualRange = {
    rows: [],
    spaceAfter: 0,
    totalSize: 0,
    visibleStart: -1,
    visibleEnd: -1,
};

/**
 * The rows a virtual list renders for a scroll position (spec/README.md, "Virtual lists"): the
 * rows in view, `overscan` rows beyond each end, the pinned rows and the sticky row of the group
 * in view, each with the room before it. Pure: the framework renders the rows, the virtualizer
 * reads the DOM.
 */
export function virtualLayout(
    options: VirtualLayoutOptions,
    starts: Float64Array = rowStarts(
        options.count,
        options.size,
        options.gap ?? 0,
    ),
): VirtualRange {
    const {
        count,
        size,
        gap = 0,
        overscan = 4,
        pinned = [],
        sticky = [],
    } = options;
    if (count <= 0) {
        return EMPTY;
    }
    const totalSize = starts[count] as number;
    const top = Math.min(Math.max(options.offset, 0), totalSize);
    const bottom = top + Math.max(options.viewport, 0);
    const visibleStart = rowAt(starts, top);
    // the last row that starts before the view's far edge
    let visibleEnd = rowAt(starts, bottom);
    if (visibleEnd > visibleStart && (starts[visibleEnd] as number) >= bottom) {
        visibleEnd -= 1;
    }
    const indexes = new Set<number>();
    const from = Math.max(0, visibleStart - overscan);
    const to = Math.min(count - 1, visibleEnd + overscan);
    for (let index = from; index <= to; index += 1) {
        indexes.add(index);
    }
    for (const index of pinned) {
        if (Number.isInteger(index) && index >= 0 && index < count) {
            indexes.add(index);
        }
    }
    const stuck = activeSticky(sticky, visibleStart);
    if (stuck !== undefined) {
        indexes.add(stuck);
    }
    const rows: VirtualRow[] = [];
    let end: number | undefined;
    for (const index of [...indexes].sort((a, b) => a - b)) {
        const start = starts[index] as number;
        const rowSize = size(index);
        rows.push({
            index,
            start,
            size: rowSize,
            spaceBefore: Math.max(
                0,
                end === undefined ? start : start - end - gap,
            ),
            sticky: index === stuck,
        });
        end = start + rowSize;
    }
    return {
        rows,
        spaceAfter: Math.max(0, totalSize - (end ?? 0)),
        totalSize,
        visibleStart,
        visibleEnd,
    };
}

/**
 * The row a page away from `from` (PageDown `1`, PageUp `-1`): the farthest row whose far edge is
 * within `viewport` of `from`'s near edge; the last (first) row when the whole list fits. As
 * `/selection`'s `pageTarget`, computed on the sizes instead of the elements, so it reaches rows
 * that are not rendered.
 */
export function pageIndex(
    starts: Float64Array,
    size: (index: number) => number,
    from: number,
    delta: 1 | -1,
    viewport: number,
): number {
    const count = starts.length - 1;
    const last = count - 1;
    if (count <= 0) {
        return -1;
    }
    const edge = delta === 1 ? last : 0;
    if ((starts[count] as number) <= viewport || viewport <= 0) {
        return edge;
    }
    const current = Math.min(Math.max(from, 0), last);
    const origin =
        delta === 1
            ? (starts[current] as number)
            : (starts[current] as number) + size(current);
    let target = current;
    for (
        let index = current + delta;
        index >= 0 && index <= last;
        index += delta
    ) {
        const far =
            delta === 1
                ? (starts[index] as number) + size(index)
                : (starts[index] as number);
        if (Math.abs(far - origin) > viewport) {
            break;
        }
        target = index;
    }
    return target === current
        ? Math.min(Math.max(current + delta, 0), last)
        : target;
}
