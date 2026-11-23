import { type Direction, getDirection } from "../direction/direction.ts";

export type CarouselOrientation = "horizontal" | "vertical";

/**
 * Where `group` must be scrolled for `slide` to sit at its start (spec/carousel.md, "Pointer"):
 * the `scrollLeft` (or `scrollTop`) that aligns the slide's inline-start edge (its top) with the
 * group's, less the group's padding there. In RTL the start is the right edge and Chromium's
 * `scrollLeft` runs from `0` to negative values, so the same subtraction holds.
 */
export function slideScrollPosition(
    group: HTMLElement,
    slide: HTMLElement,
    orientation: CarouselOrientation,
    direction?: Direction | null,
): number {
    const groupBox = group.getBoundingClientRect();
    const slideBox = slide.getBoundingClientRect();
    const style = group.ownerDocument.defaultView?.getComputedStyle(group);
    const padding = (value: string | undefined) =>
        Number.parseFloat(value ?? "") || 0;
    if (orientation === "vertical") {
        return (
            group.scrollTop +
            slideBox.top -
            groupBox.top -
            group.clientTop -
            padding(style?.paddingTop)
        );
    }
    if (getDirection(group, direction) === "rtl") {
        // the inner right edge: the group's box less its right border
        const borderRight =
            groupBox.width - group.clientLeft - group.clientWidth;
        const start =
            groupBox.right - borderRight - padding(style?.paddingRight);
        return group.scrollLeft + slideBox.right - start;
    }
    return (
        group.scrollLeft +
        slideBox.left -
        groupBox.left -
        group.clientLeft -
        padding(style?.paddingLeft)
    );
}

/** The group's scroll position on its axis. */
export function groupScrollPosition(
    group: HTMLElement,
    orientation: CarouselOrientation,
): number {
    return orientation === "vertical" ? group.scrollTop : group.scrollLeft;
}

/**
 * The page whose first slide is nearest the group's scroll position (`pages` holds each page's
 * first slide; `slide(index)` gives a slide's element): the page a scroll settled on.
 */
export function nearestCarouselPage(
    group: HTMLElement,
    pages: readonly number[],
    slide: (index: number) => HTMLElement | null,
    orientation: CarouselOrientation,
    direction?: Direction | null,
): number {
    const position = groupScrollPosition(group, orientation);
    let best = 0;
    let distance = Number.POSITIVE_INFINITY;
    pages.forEach((start, page) => {
        const element = slide(start);
        if (element === null) {
            return;
        }
        const away = Math.abs(
            slideScrollPosition(group, element, orientation, direction) -
                position,
        );
        if (away < distance) {
            distance = away;
            best = page;
        }
    });
    return best;
}
