import {
    pageIndex,
    rowStarts,
    type VirtualRange,
    virtualLayout,
} from "./virtual-layout.ts";

/** Where `scrollToIndex` puts the row: `auto` scrolls the least to bring it into view. */
export type VirtualAlign = "auto" | "start" | "center" | "end";

export interface VirtualizerOptions {
    /** How many rows the list has. */
    count: number;
    /**
     * A row's size before it is measured, or every row's size when the rows are not measured
     * (fixed sizes): a number, or a function of the index (default 36).
     */
    estimateSize?: number | ((index: number) => number);
    /** The rows rendered beyond each end of the view (default 4). */
    overscan?: number;
    /** Rows always rendered (the focused, highlighted or selected one; the ends). */
    pinned?: readonly number[];
    /** The rows that stick while their group is in view (group labels), in order. */
    sticky?: readonly number[];
    /**
     * The visible size assumed before the scroll container is attached (a server render, the
     * first client render): default 0, so only the overscan rows render until then.
     */
    initialViewport?: number;
    /** The rendered rows changed: render the list again and read `range()`. */
    onChange?: () => void;
}

/**
 * A virtual list's mechanism (spec/README.md, "Virtual lists"): the rows to render for the
 * scroll position, their measured sizes and the scrolling to a row. It holds no component state
 * (rule 2): the framework keeps the items, the focus and the highlight, renders the rows of
 * `range()` and gives each its `spaceBefore` as `margin-block-start` (the last one
 * `spaceAfter` as `margin-block-end`), `flex-shrink: 0` and `overflow-anchor: none` (the
 * virtualizer keeps the view still itself), so the list keeps its flow layout (sticky labels,
 * flex gaps) with no extra element.
 */
export interface Virtualizer {
    /** New options (the count, the pinned rows, ...); the next `range()` follows them. */
    update(options: Partial<VirtualizerOptions>): void;
    /** The rows to render now. */
    range(): VirtualRange;
    /**
     * Watches the list's scroll container (`scroller`, default the list or its nearest
     * scrollable ancestor) and its size; returns the cleanup.
     */
    attach(list: HTMLElement, scroller?: HTMLElement | null): () => void;
    /** Measures a rendered row now and whenever its size changes; returns the cleanup. */
    measure(index: number, element: HTMLElement): () => void;
    /** Scrolls the container so the row is in view, and updates the range at once. */
    scrollToIndex(index: number, align?: VirtualAlign): void;
    /** The row a page away (PageDown `1`, PageUp `-1`), by the sizes and the visible size. */
    pageIndex(from: number, delta: 1 | -1): number;
}

/**
 * The scroll container of a list: the list itself when it scrolls, else its nearest ancestor
 * whose `overflow-y` scrolls; the list when none does.
 */
export function scrollContainer(list: HTMLElement): HTMLElement {
    const view = list.ownerDocument.defaultView;
    for (
        let element: HTMLElement | null = list;
        element !== null;
        element = element.parentElement
    ) {
        const overflow = view?.getComputedStyle(element).overflowY ?? "";
        if (
            overflow === "auto" ||
            overflow === "scroll" ||
            overflow === "overlay"
        ) {
            return element;
        }
    }
    return list;
}

function pixels(value: string): number {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : 0;
}

/** Same rows and same room: nothing to render again. */
function sameRange(a: VirtualRange | null, b: VirtualRange): boolean {
    if (
        a === null ||
        a.rows.length !== b.rows.length ||
        Math.round(a.spaceAfter) !== Math.round(b.spaceAfter)
    ) {
        return false;
    }
    return a.rows.every((row, index) => {
        const other = b.rows[index];
        return (
            other !== undefined &&
            row.index === other.index &&
            row.sticky === other.sticky &&
            Math.round(row.spaceBefore) === Math.round(other.spaceBefore)
        );
    });
}

/** Creates a virtualizer (`Virtualizer`); it reads the DOM only once attached. */
export function createVirtualizer(initial: VirtualizerOptions): Virtualizer {
    let options: VirtualizerOptions = { ...initial };
    const sizes = new Map<number, number>();
    let starts: Float64Array | null = null;
    let list: HTMLElement | null = null;
    let scroller: HTMLElement | null = null;
    let offset = 0;
    let viewport: number | null = null;
    let gap = 0;
    let current: VirtualRange | null = null;
    let emitted: VirtualRange | null = null;
    let observer: ResizeObserver | null = null;
    const observed = new Map<Element, number>();

    const estimate = (index: number): number => {
        const { estimateSize = 36 } = options;
        return typeof estimateSize === "number"
            ? estimateSize
            : estimateSize(index);
    };
    const size = (index: number): number => sizes.get(index) ?? estimate(index);
    const startsOf = (): Float64Array => {
        if (starts === null || starts.length !== options.count + 1) {
            starts = rowStarts(options.count, size, gap);
        }
        return starts;
    };
    const visible = () => viewport ?? options.initialViewport ?? 0;

    const range = (): VirtualRange => {
        if (current === null) {
            current = virtualLayout(
                {
                    count: options.count,
                    size,
                    gap,
                    offset,
                    viewport: visible(),
                    overscan: options.overscan,
                    pinned: options.pinned,
                    sticky: options.sticky,
                },
                startsOf(),
            );
        }
        return current;
    };
    /** The range changed: tell the framework, once per change. */
    const notify = () => {
        current = null;
        const next = range();
        if (sameRange(emitted, next)) {
            return;
        }
        emitted = next;
        options.onChange?.();
    };

    /** Where the list's first row sits in the scroll container's content. */
    const listTop = (): number => {
        if (list === null || scroller === null) {
            return 0;
        }
        const style = list.ownerDocument.defaultView?.getComputedStyle(list);
        const padding = pixels(style?.paddingTop ?? "");
        if (list === scroller) {
            return padding;
        }
        const box = list.getBoundingClientRect();
        const container = scroller.getBoundingClientRect();
        return (
            box.top -
            container.top -
            scroller.clientTop +
            scroller.scrollTop +
            list.clientTop +
            padding
        );
    };
    /** Reads the scroll position, the visible size and the gap. */
    const read = () => {
        if (list === null || scroller === null) {
            return;
        }
        offset = scroller.scrollTop - listTop();
        viewport = scroller.clientHeight;
        const style = list.ownerDocument.defaultView?.getComputedStyle(list);
        const nextGap = pixels(style?.rowGap ?? "");
        if (nextGap !== gap) {
            gap = nextGap;
            starts = null;
        }
    };
    /**
     * A row's measured size. A row above the view that changes size moves the scroll position by
     * the change, so the rows in view stay still (the scroll anchoring the rows opt out of: the
     * browser's would also follow the rows the virtualizer adds and removes).
     */
    const setSize = (index: number, next: number): boolean => {
        const previous = size(index);
        if (next <= 0 || sizes.get(index) === next) {
            return false;
        }
        const above =
            scroller !== null &&
            (startsOf()[index] as number) + previous <= offset;
        sizes.set(index, next);
        starts = null;
        if (above && scroller !== null && next !== previous) {
            scroller.scrollTop += next - previous;
            offset += next - previous;
        }
        return true;
    };

    return {
        update(next) {
            const countChanged =
                next.count !== undefined && next.count !== options.count;
            options = { ...options, ...next };
            if (countChanged) {
                starts = null;
            }
            current = null;
            // the framework renders after an update: what it renders is what was emitted
            emitted = range();
        },
        range,
        attach(element, container) {
            list = element;
            scroller = container ?? scrollContainer(element);
            const view = element.ownerDocument.defaultView;
            const onScroll = () => {
                read();
                notify();
            };
            scroller.addEventListener("scroll", onScroll, { passive: true });
            const Observer = view?.ResizeObserver;
            observer =
                Observer === undefined
                    ? null
                    : new Observer((entries) => {
                          let changed = false;
                          for (const entry of entries) {
                              const index = observed.get(entry.target);
                              if (index === undefined) {
                                  continue;
                              }
                              const box = entry.borderBoxSize?.[0];
                              changed =
                                  setSize(
                                      index,
                                      box === undefined
                                          ? (entry.target as HTMLElement)
                                                .offsetHeight
                                          : box.blockSize,
                                  ) || changed;
                          }
                          read();
                          if (changed || entries.length > 0) {
                              notify();
                          }
                      });
            observer?.observe(scroller);
            if (element !== scroller) {
                observer?.observe(element);
            }
            for (const target of observed.keys()) {
                observer?.observe(target);
            }
            read();
            notify();
            const attached = scroller;
            return () => {
                attached.removeEventListener("scroll", onScroll);
                observer?.disconnect();
                observer = null;
                list = null;
                scroller = null;
                viewport = null;
            };
        },
        measure(index, element) {
            observed.set(element, index);
            observer?.observe(element);
            if (list !== null) {
                // a row measured as it renders: the list renders again with its real size, its
                // layout size (a popup's opening scale transforms its box, never its size)
                if (setSize(index, element.offsetHeight)) {
                    notify();
                }
            }
            return () => {
                if (observed.get(element) === index) {
                    observed.delete(element);
                    observer?.unobserve(element);
                }
            };
        },
        scrollToIndex(index, align = "auto") {
            if (index < 0 || index >= options.count) {
                return;
            }
            if (scroller === null) {
                // before attach: the range starts at the row
                offset = startsOf()[index] as number;
                notify();
                return;
            }
            read();
            const rowStart = startsOf()[index] as number;
            const rowEnd = rowStart + size(index);
            const top = listTop();
            const height = scroller.clientHeight;
            let target: number | undefined;
            if (align === "start") {
                target = rowStart;
            } else if (align === "end") {
                target = rowEnd - height;
            } else if (align === "center") {
                target = (rowStart + rowEnd - height) / 2;
            } else if (rowStart < offset) {
                target = rowStart;
            } else if (rowEnd > offset + height) {
                target = rowEnd - height;
            }
            if (target !== undefined) {
                scroller.scrollTop = Math.max(0, target + top);
            }
            read();
            // the row is in the range at once, before the scroll event (a key that moves the
            // focus renders the row within the event); a container that cannot scroll (no layout)
            // keeps the asked offset
            if (
                target !== undefined &&
                target > 0 &&
                scroller.scrollTop === 0
            ) {
                offset = target;
            }
            notify();
        },
        pageIndex(from, delta) {
            return pageIndex(startsOf(), size, from, delta, visible());
        },
    };
}
