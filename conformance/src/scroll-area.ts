import { expect, type Locator, type Page } from "@playwright/test";

// spec/scroll-area.md: the parts of a scroll area found from its viewport, a `region` the
// fixture names, and the geometry the tests compare.

/** The Viewport the fixture names (`role="region"`). */
export const viewport = (page: Page, name: string): Locator =>
    page.getByRole("region", { name, exact: true });

/** The Root around a named Viewport. */
export const scrollRoot = (page: Page, name: string): Locator =>
    page
        .locator('[data-primitives-part="scroll-area-root"]')
        .filter({ has: viewport(page, name) });

/** The Scrollbar of one axis inside a Root. */
export const scrollbar = (
    root: Locator,
    orientation: "vertical" | "horizontal",
): Locator =>
    root.locator(
        `[data-primitives-part="scroll-area-scrollbar"][data-orientation="${orientation}"]`,
    );

/** The Thumb of a Scrollbar. */
export const thumb = (bar: Locator): Locator =>
    bar.locator('[data-primitives-part="scroll-area-thumb"]');

export interface ScrollMetrics {
    scrollTop: number;
    scrollLeft: number;
    maxY: number;
    maxX: number;
    clientHeight: number;
    scrollHeight: number;
    clientWidth: number;
    scrollWidth: number;
}

/** The viewport's scroll position and range. */
export async function scrollMetrics(view: Locator): Promise<ScrollMetrics> {
    return view.evaluate((element) => ({
        scrollTop: element.scrollTop,
        scrollLeft: element.scrollLeft,
        maxY: element.scrollHeight - element.clientHeight,
        maxX: element.scrollWidth - element.clientWidth,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
    }));
}

export interface TrackGeometry {
    /** The track's content box (its padding excluded), in page pixels. */
    start: number;
    end: number;
    /** The track's room along its axis. */
    room: number;
    /** The thumb's box along the axis. */
    thumbStart: number;
    thumbEnd: number;
    thumbSize: number;
}

/** A Scrollbar's track and its Thumb, along the scrollbar's axis. */
export async function trackGeometry(bar: Locator): Promise<TrackGeometry> {
    return bar.evaluate((element) => {
        const vertical =
            element.getAttribute("data-orientation") === "vertical";
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const thumbElement = element.querySelector(
            '[data-primitives-part="scroll-area-thumb"]',
        );
        const box = thumbElement?.getBoundingClientRect();
        const start = vertical
            ? rect.top + Number.parseFloat(style.paddingTop)
            : rect.left + Number.parseFloat(style.paddingLeft);
        const end = vertical
            ? rect.bottom - Number.parseFloat(style.paddingBottom)
            : rect.right - Number.parseFloat(style.paddingRight);
        return {
            start,
            end,
            room: end - start,
            thumbStart: (vertical ? box?.top : box?.left) ?? Number.NaN,
            thumbEnd: (vertical ? box?.bottom : box?.right) ?? Number.NaN,
            thumbSize: (vertical ? box?.height : box?.width) ?? Number.NaN,
        };
    });
}

/** Sets the viewport's scroll position from a script (a programmatic scroll). */
export async function scrollViewportTo(
    view: Locator,
    position: { top?: number; left?: number },
): Promise<void> {
    await view.evaluate((element, { top, left }) => {
        if (top !== undefined) {
            element.scrollTop = top;
        }
        if (left !== undefined) {
            element.scrollLeft = left;
        }
    }, position);
}

/**
 * Waits until the thumb sits where the scroll position puts it, within a pixel: its offset from
 * the track's start (the right edge for a horizontal track in RTL) over the room it leaves is
 * the scroll's fraction of its range.
 */
export async function expectThumbFollows(
    view: Locator,
    bar: Locator,
    rtl = false,
): Promise<void> {
    const vertical =
        (await bar.getAttribute("data-orientation")) === "vertical";
    await expect
        .poll(async () => {
            const metrics = await scrollMetrics(view);
            const track = await trackGeometry(bar);
            const max = vertical ? metrics.maxY : metrics.maxX;
            const position = vertical
                ? metrics.scrollTop
                : Math.abs(metrics.scrollLeft);
            const free = track.room - track.thumbSize;
            const expected = max > 0 ? (position / max) * free : 0;
            const actual =
                !vertical && rtl
                    ? track.end - track.thumbEnd
                    : track.thumbStart - track.start;
            return Math.round(Math.abs(actual - expected));
        })
        .toBeLessThanOrEqual(1);
}
