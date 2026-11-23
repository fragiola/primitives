import type { Direction } from "../direction/direction.ts";
import {
    scrollForThumbOffset,
    scrollFromStart,
    thumbGeometry,
} from "./scroll-geometry.ts";

/** How long `scrolling` stays after the last user scroll, in milliseconds (Base UI's). */
const SCROLLING_TIMEOUT = 500;

/** How long after the last scroll event a scroll ends (and the next one is programmatic). */
const SCROLL_END_TIMEOUT = 100;

/** The elements that take the focus: the Viewport needs no tab stop of its own when one is in it. */
const FOCUSABLE =
    'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, summary, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex^="-"])';

export type ScrollAreaOrientation = "vertical" | "horizontal";

/** How far from each edge, in pixels, the content must be scrolled before its edge is set. */
export interface ScrollAreaThreshold {
    xStart: number;
    xEnd: number;
    yStart: number;
    yEnd: number;
}

/** A threshold for every edge, or per edge (a missing edge is `0`). */
export type ScrollAreaThresholdInput = number | Partial<ScrollAreaThreshold>;

/** What a ScrollArea renders (spec/scroll-area.md, "State attributes and ARIA"). */
export interface ScrollAreaState {
    /** The first measurement ran (never on a server). */
    measured: boolean;
    hasOverflowX: boolean;
    hasOverflowY: boolean;
    overflowXStart: boolean;
    overflowXEnd: boolean;
    overflowYStart: boolean;
    overflowYEnd: boolean;
    /** The user scrolls the horizontal axis (until 500 ms after the last scroll). */
    scrollingX: boolean;
    scrollingY: boolean;
    /** A mouse or pen is over the Root. */
    hovering: boolean;
    /** The Viewport needs a tab stop: it overflows and holds nothing focusable. */
    focusable: boolean;
}

/** The parts the controller measures and listens to, registered as they mount. */
export type ScrollAreaPart =
    | "viewport"
    | "content"
    | "scrollbar-x"
    | "scrollbar-y"
    | "thumb-x"
    | "thumb-y";

export interface ScrollAreaOptions {
    /** The DirectionProvider's direction, read at each measurement (`null`: the Viewport's own). */
    direction?: (() => Direction | null) | undefined;
    /** The Root's `overflowEdgeThreshold`, read at each measurement. */
    threshold?: (() => ScrollAreaThresholdInput | undefined) | undefined;
    /** Every change of the state, with the whole new state. */
    onStateChange: (state: ScrollAreaState) => void;
}

export interface ScrollAreaController {
    /** Registers a part's element (`null` when it unmounts), and measures. */
    setPart: (part: ScrollAreaPart, element: HTMLElement | null) => void;
    /** Measures again (the direction or the threshold changed). */
    update: () => void;
    /** Removes every listener, observer and timer, and ends a drag. */
    destroy: () => void;
}

/** The state before any measurement: what a server renders. */
export function initialScrollAreaState(): ScrollAreaState {
    return {
        measured: false,
        hasOverflowX: false,
        hasOverflowY: false,
        overflowXStart: false,
        overflowXEnd: false,
        overflowYStart: false,
        overflowYEnd: false,
        scrollingX: false,
        scrollingY: false,
        hovering: false,
        focusable: false,
    };
}

/** The threshold of every edge, each at least `0`. */
export function normalizeScrollAreaThreshold(
    input: ScrollAreaThresholdInput | undefined,
): ScrollAreaThreshold {
    const edges =
        typeof input === "number"
            ? { xStart: input, xEnd: input, yStart: input, yEnd: input }
            : (input ?? {});
    const edge = (value: number | undefined) =>
        Math.max(0, Number.isFinite(value) ? (value as number) : 0);
    return {
        xStart: edge(edges.xStart),
        xEnd: edge(edges.xEnd),
        yStart: edge(edges.yStart),
        yEnd: edge(edges.yEnd),
    };
}

interface Drag {
    vertical: boolean;
    pointerId: number;
    start: number;
    startScroll: number;
    capture: HTMLElement;
    stop: () => void;
}

/**
 * A ScrollArea's DOM side (spec/scroll-area.md): it measures the Viewport and its Content (on
 * mount, on scroll, on resize through a `ResizeObserver`), writes the measured CSS variables and
 * each Thumb's transform, and runs the Scrollbars' pointer (thumb drag, track press, wheel) and
 * the Root's hover, all with native listeners. It reports the state the framework renders; it
 * holds no value and renders nothing.
 */
export function createScrollArea(
    root: HTMLElement,
    options: ScrollAreaOptions,
): ScrollAreaController {
    const view = root.ownerDocument.defaultView;
    const parts: Partial<Record<ScrollAreaPart, HTMLElement>> = {};
    const partCleanups: Partial<Record<ScrollAreaPart, () => void>> = {};
    let state = initialScrollAreaState();
    let destroyed = false;
    let touch = false;
    let userScroll = false;
    let lastScroll = { x: 0, y: 0 };
    let drag: Drag | null = null;
    let savedSnap: string | null = null;
    const timers: Record<"x" | "y" | "end", number | undefined> = {
        x: undefined,
        y: undefined,
        end: undefined,
    };
    const observer =
        view !== null && typeof view.ResizeObserver === "function"
            ? new view.ResizeObserver(() => measure())
            : null;

    const emit = (patch: Partial<ScrollAreaState>) => {
        if (destroyed) {
            return;
        }
        let changed = false;
        for (const key of Object.keys(patch) as (keyof ScrollAreaState)[]) {
            if (state[key] !== patch[key]) {
                changed = true;
            }
        }
        if (changed) {
            state = { ...state, ...patch };
            options.onStateChange(state);
        }
    };

    const clearTimer = (name: "x" | "y" | "end") => {
        if (timers[name] !== undefined) {
            view?.clearTimeout(timers[name]);
            timers[name] = undefined;
        }
    };

    const startScrolling = (vertical: boolean) => {
        const axis = vertical ? "y" : "x";
        emit(vertical ? { scrollingY: true } : { scrollingX: true });
        clearTimer(axis);
        timers[axis] = view?.setTimeout(() => {
            timers[axis] = undefined;
            // a drag keeps its axis scrolling until it ends
            if (drag?.vertical !== vertical) {
                emit(vertical ? { scrollingY: false } : { scrollingX: false });
            }
        }, SCROLLING_TIMEOUT);
    };

    const isRtl = (element: HTMLElement) => {
        const provided = options.direction?.() ?? null;
        if (provided !== null) {
            return provided === "rtl";
        }
        return view?.getComputedStyle(element).direction === "rtl";
    };

    const sizes = (element: HTMLElement | undefined, vertical: boolean) => {
        if (element === undefined || view === null) {
            return { start: 0, end: 0 };
        }
        const style = view.getComputedStyle(element);
        const read = (name: string) =>
            Number.parseFloat(style.getPropertyValue(name)) || 0;
        return vertical
            ? { start: read("padding-top"), end: read("padding-bottom") }
            : {
                  start: read("padding-inline-start"),
                  end: read("padding-inline-end"),
              };
    };

    const margins = (element: HTMLElement | undefined, vertical: boolean) => {
        if (element === undefined || view === null) {
            return 0;
        }
        const style = view.getComputedStyle(element);
        const read = (name: string) =>
            Number.parseFloat(style.getPropertyValue(name)) || 0;
        return vertical
            ? read("margin-top") + read("margin-bottom")
            : read("margin-inline-start") + read("margin-inline-end");
    };

    /** The track's room and the thumb's size along an axis, for the pointer's math. */
    const trackOf = (vertical: boolean) => {
        const scrollbar = parts[vertical ? "scrollbar-y" : "scrollbar-x"];
        const thumb = parts[vertical ? "thumb-y" : "thumb-x"];
        if (scrollbar === undefined) {
            return null;
        }
        const padding = sizes(scrollbar, vertical);
        const track = vertical ? scrollbar.offsetHeight : scrollbar.offsetWidth;
        const room =
            track - padding.start - padding.end - margins(thumb, vertical);
        const size =
            thumb === undefined
                ? 0
                : vertical
                  ? thumb.offsetHeight
                  : thumb.offsetWidth;
        return { scrollbar, thumb, room, size, paddingStart: padding.start };
    };

    function measure() {
        const viewport = parts.viewport;
        if (destroyed || viewport === undefined) {
            return;
        }
        const {
            scrollHeight,
            scrollWidth,
            clientHeight,
            clientWidth,
            scrollTop,
            scrollLeft,
        } = viewport;
        if (scrollHeight === 0 || scrollWidth === 0) {
            // not laid out (hidden): nothing to measure yet
            emit({ measured: true });
            return;
        }
        const rtl = isRtl(viewport);
        const hasOverflowX = clientWidth < scrollWidth;
        const hasOverflowY = clientHeight < scrollHeight;
        const maxX = Math.max(0, scrollWidth - clientWidth);
        const maxY = Math.max(0, scrollHeight - clientHeight);
        const fromStartX = hasOverflowX
            ? scrollFromStart(rtl ? -scrollLeft : scrollLeft, maxX)
            : 0;
        const fromStartY = hasOverflowY ? scrollFromStart(scrollTop, maxY) : 0;
        const edges = [
            fromStartX,
            maxX - fromStartX,
            fromStartY,
            maxY - fromStartY,
        ];

        // the corner first: the scrollbars' tracks end at it
        const both = hasOverflowX && hasOverflowY;
        const cornerWidth = both ? (parts["scrollbar-y"]?.offsetWidth ?? 0) : 0;
        const cornerHeight = both
            ? (parts["scrollbar-x"]?.offsetHeight ?? 0)
            : 0;
        root.style.setProperty(
            "--scroll-area-corner-width",
            `${cornerWidth}px`,
        );
        root.style.setProperty(
            "--scroll-area-corner-height",
            `${cornerHeight}px`,
        );

        for (const vertical of [true, false]) {
            const track = trackOf(vertical);
            if (track === null) {
                continue;
            }
            const geometry = thumbGeometry({
                clientSize: vertical ? clientHeight : clientWidth,
                scrollSize: vertical ? scrollHeight : scrollWidth,
                fromStart: vertical ? fromStartY : fromStartX,
                room: track.room,
            });
            track.scrollbar.style.setProperty(
                vertical
                    ? "--scroll-area-thumb-height"
                    : "--scroll-area-thumb-width",
                `${geometry.size}px`,
            );
            if (track.thumb !== undefined) {
                const offset = vertical
                    ? `0px, ${geometry.offset}px, 0px`
                    : `${rtl ? -geometry.offset : geometry.offset}px, 0px, 0px`;
                track.thumb.style.transform = `translate3d(${offset})`;
            }
        }

        const names = ["x-start", "x-end", "y-start", "y-end"];
        names.forEach((name, index) => {
            viewport.style.setProperty(
                `--scroll-area-overflow-${name}`,
                `${edges[index]}px`,
            );
        });

        const threshold = normalizeScrollAreaThreshold(options.threshold?.());
        emit({
            measured: true,
            hasOverflowX,
            hasOverflowY,
            overflowXStart: hasOverflowX && fromStartX > threshold.xStart,
            overflowXEnd: hasOverflowX && maxX - fromStartX > threshold.xEnd,
            overflowYStart: hasOverflowY && fromStartY > threshold.yStart,
            overflowYEnd: hasOverflowY && maxY - fromStartY > threshold.yEnd,
            focusable:
                (hasOverflowX || hasOverflowY) &&
                viewport.querySelector(FOCUSABLE) === null,
        });
    }

    // the Root: the hover of a mouse or pen, and the touch modality
    const onRootPointer = (event: PointerEvent) => {
        touch = event.pointerType === "touch";
        if (event.type !== "pointerdown" && !touch) {
            emit({
                hovering:
                    event.target instanceof Node && root.contains(event.target),
            });
        }
    };
    const onRootLeave = () => emit({ hovering: false });
    root.addEventListener("pointerenter", onRootPointer);
    root.addEventListener("pointermove", onRootPointer);
    root.addEventListener("pointerdown", onRootPointer);
    root.addEventListener("pointerleave", onRootLeave);
    try {
        if (root.matches(":hover")) {
            emit({ hovering: true });
        }
    } catch {
        // a document with no `:hover` support
    }

    const scrollTo = (vertical: boolean, fromStart: number) => {
        const viewport = parts.viewport;
        if (viewport === undefined) {
            return;
        }
        if (vertical) {
            viewport.scrollTop = fromStart;
        } else {
            viewport.scrollLeft = isRtl(viewport) ? -fromStart : fromStart;
        }
    };

    const disableSnap = () => {
        const viewport = parts.viewport;
        if (viewport !== undefined && savedSnap === null) {
            savedSnap = viewport.style.scrollSnapType;
            viewport.style.scrollSnapType = "none";
        }
    };

    const restoreSnap = () => {
        if (savedSnap !== null && parts.viewport !== undefined) {
            parts.viewport.style.scrollSnapType = savedSnap;
        }
        savedSnap = null;
    };

    const endDrag = () => {
        const current = drag;
        if (current === null) {
            return;
        }
        drag = null;
        current.stop();
        restoreSnap();
        clearTimer(current.vertical ? "y" : "x");
        emit(current.vertical ? { scrollingY: false } : { scrollingX: false });
    };

    /** A drag of the thumb from `event` (a press on the thumb, or a track press after its jump). */
    const startDrag = (vertical: boolean, event: PointerEvent) => {
        const viewport = parts.viewport;
        const capture =
            parts[vertical ? "thumb-y" : "thumb-x"] ??
            parts[vertical ? "scrollbar-y" : "scrollbar-x"];
        if (viewport === undefined || capture === undefined || view === null) {
            return;
        }
        endDrag();
        const rtl = !vertical && isRtl(viewport);
        const point = (pointer: PointerEvent) =>
            vertical
                ? pointer.clientY
                : rtl
                  ? -pointer.clientX
                  : pointer.clientX;
        const max = vertical
            ? viewport.scrollHeight - viewport.clientHeight
            : viewport.scrollWidth - viewport.clientWidth;
        const startScroll = vertical
            ? viewport.scrollTop
            : scrollFromStart(
                  rtl ? -viewport.scrollLeft : viewport.scrollLeft,
                  max,
              );
        const pointerId = event.pointerId;
        const onMove = (move: PointerEvent) => {
            if (move.pointerId !== pointerId) {
                return;
            }
            // a move with the primary button up: the release was lost
            if ((move.buttons & 1) === 0) {
                endDrag();
                return;
            }
            const track = trackOf(vertical);
            if (track === null) {
                return;
            }
            const delta = point(move) - (drag?.start ?? 0);
            const offset =
                (max > 0
                    ? (startScroll / max) * (track.room - track.size)
                    : 0) + delta;
            scrollTo(
                vertical,
                scrollForThumbOffset(offset, track.room - track.size, max),
            );
            move.preventDefault();
            startScrolling(vertical);
        };
        const onUp = (up: PointerEvent) => {
            if (up.pointerId === pointerId) {
                endDrag();
            }
        };
        try {
            capture.setPointerCapture(pointerId);
        } catch {
            // a synthetic event without an active pointer: the window listeners still follow it
        }
        view.addEventListener("pointermove", onMove);
        view.addEventListener("pointerup", onUp);
        view.addEventListener("pointercancel", onUp);
        capture.addEventListener("lostpointercapture", endDrag);
        drag = {
            vertical,
            pointerId,
            start: point(event),
            startScroll,
            capture,
            stop: () => {
                view.removeEventListener("pointermove", onMove);
                view.removeEventListener("pointerup", onUp);
                view.removeEventListener("pointercancel", onUp);
                capture.removeEventListener("lostpointercapture", endDrag);
                try {
                    if (capture.hasPointerCapture(pointerId)) {
                        capture.releasePointerCapture(pointerId);
                    }
                } catch {
                    // already released
                }
            },
        };
        disableSnap();
        startScrolling(vertical);
    };

    const watchScrollbar = (scrollbar: HTMLElement, vertical: boolean) => {
        const onPointerDown = (event: PointerEvent) => {
            const viewport = parts.viewport;
            if (event.button !== 0 || viewport === undefined) {
                return;
            }
            const thumb = parts[vertical ? "thumb-y" : "thumb-x"];
            const onThumb =
                thumb !== undefined &&
                event.target instanceof Node &&
                thumb.contains(event.target);
            if (!onThumb) {
                // the track: jump so the thumb's center is under the pointer, then drag
                const track = trackOf(vertical);
                if (track === null || track.room - track.size <= 0) {
                    return;
                }
                const rect = scrollbar.getBoundingClientRect();
                const rtl = !vertical && isRtl(viewport);
                const along = vertical
                    ? event.clientY - rect.top
                    : rtl
                      ? rect.right - event.clientX
                      : event.clientX - rect.left;
                const max = vertical
                    ? viewport.scrollHeight - viewport.clientHeight
                    : viewport.scrollWidth - viewport.clientWidth;
                disableSnap();
                scrollTo(
                    vertical,
                    scrollForThumbOffset(
                        along - track.paddingStart - track.size / 2,
                        track.room - track.size,
                        max,
                    ),
                );
                measure();
            }
            startDrag(vertical, event);
        };
        // a press on a scrollbar moves no focus, as a native scrollbar's
        const onMouseDown = (event: MouseEvent) => event.preventDefault();
        const onWheel = (event: WheelEvent) => {
            const viewport = parts.viewport;
            if (viewport === undefined || event.ctrlKey) {
                return;
            }
            const delta = vertical ? event.deltaY : event.deltaX;
            if (delta === 0) {
                return;
            }
            const max = vertical
                ? viewport.scrollHeight - viewport.clientHeight
                : viewport.scrollWidth - viewport.clientWidth;
            const rtl = !vertical && isRtl(viewport);
            const position = vertical
                ? viewport.scrollTop
                : rtl
                  ? -viewport.scrollLeft
                  : viewport.scrollLeft;
            // a wheel toward an edge the viewport is at goes on to the page
            const forward = rtl ? -delta : delta;
            if (
                (position <= 0 && forward < 0) ||
                (position >= max && forward > 0)
            ) {
                return;
            }
            event.preventDefault();
            userScroll = true;
            scrollTo(vertical, Math.min(max, Math.max(0, position + forward)));
        };
        scrollbar.addEventListener("pointerdown", onPointerDown);
        scrollbar.addEventListener("mousedown", onMouseDown);
        scrollbar.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            scrollbar.removeEventListener("pointerdown", onPointerDown);
            scrollbar.removeEventListener("mousedown", onMouseDown);
            scrollbar.removeEventListener("wheel", onWheel);
        };
    };

    const watchViewport = (viewport: HTMLElement) => {
        lastScroll = { x: viewport.scrollLeft, y: viewport.scrollTop };
        const onInteraction = () => {
            userScroll = true;
        };
        const onScroll = () => {
            measure();
            const position = { x: viewport.scrollLeft, y: viewport.scrollTop };
            // a touch's momentum fires no event of its own: every scroll in touch is the user's
            if (touch || userScroll) {
                if (position.y !== lastScroll.y) {
                    startScrolling(true);
                }
                if (position.x !== lastScroll.x) {
                    startScrolling(false);
                }
            }
            lastScroll = position;
            clearTimer("end");
            timers.end = view?.setTimeout(() => {
                timers.end = undefined;
                if (drag === null) {
                    userScroll = false;
                }
            }, SCROLL_END_TIMEOUT);
        };
        const events = [
            "wheel",
            "pointermove",
            "pointerenter",
            "keydown",
            "touchstart",
        ];
        for (const name of events) {
            viewport.addEventListener(name, onInteraction, { passive: true });
        }
        viewport.addEventListener("scroll", onScroll, { passive: true });
        observer?.observe(viewport);
        return () => {
            for (const name of events) {
                viewport.removeEventListener(name, onInteraction);
            }
            viewport.removeEventListener("scroll", onScroll);
            observer?.unobserve(viewport);
        };
    };

    const setPart = (part: ScrollAreaPart, element: HTMLElement | null) => {
        if (destroyed || parts[part] === (element ?? undefined)) {
            return;
        }
        if (drag !== null && parts[part] === drag.capture) {
            endDrag();
        }
        partCleanups[part]?.();
        delete partCleanups[part];
        if (element === null) {
            delete parts[part];
        } else {
            parts[part] = element;
            if (part === "viewport") {
                partCleanups[part] = watchViewport(element);
            } else if (part === "content") {
                observer?.observe(element);
                partCleanups[part] = () => observer?.unobserve(element);
            } else if (part === "scrollbar-x" || part === "scrollbar-y") {
                partCleanups[part] = watchScrollbar(
                    element,
                    part === "scrollbar-y",
                );
            }
        }
        measure();
    };

    return {
        setPart,
        update: measure,
        destroy: () => {
            if (destroyed) {
                return;
            }
            endDrag();
            destroyed = true;
            for (const cleanup of Object.values(partCleanups)) {
                cleanup?.();
            }
            observer?.disconnect();
            clearTimer("x");
            clearTimer("y");
            clearTimer("end");
            root.removeEventListener("pointerenter", onRootPointer);
            root.removeEventListener("pointermove", onRootPointer);
            root.removeEventListener("pointerdown", onRootPointer);
            root.removeEventListener("pointerleave", onRootLeave);
        },
    };
}
