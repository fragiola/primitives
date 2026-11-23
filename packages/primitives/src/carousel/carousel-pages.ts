export interface CarouselPagesOptions {
    /** The number of slides. */
    slideCount: number;
    /** The slides a page shows side by side (default `1`). */
    slidesPerPage?: number | undefined;
    /** The slides a page moves by (default `slidesPerPage`). */
    slidesPerMove?: number | undefined;
}

/** A positive whole number, else the fallback. */
function whole(value: number | undefined, fallback: number): number {
    return value === undefined || !Number.isFinite(value) || value < 1
        ? fallback
        : Math.floor(value);
}

/**
 * The first slide of every page, in order (spec/carousel.md, "The pages"): slide 0, then every
 * `slidesPerMove` slides while a page still shows `slidesPerPage` slides, and the last page at
 * `slideCount - slidesPerPage`, so every page is full (a snapped scroll ends there). Pure math;
 * always at least one page.
 */
export function carouselPages({
    slideCount,
    slidesPerPage,
    slidesPerMove,
}: CarouselPagesOptions): number[] {
    const count = Math.max(0, Math.floor(slideCount));
    const perPage = whole(slidesPerPage, 1);
    const perMove = whole(slidesPerMove, perPage);
    const last = Math.max(0, count - perPage);
    const starts: number[] = [];
    for (let start = 0; start < last; start += perMove) {
        starts.push(start);
    }
    starts.push(last);
    return starts;
}

/** `page` kept within the pages (`0` to `pageCount - 1`); a fraction is rounded down. */
export function clampCarouselPage(page: number, pageCount: number): number {
    if (!Number.isFinite(page)) {
        return 0;
    }
    return Math.min(Math.max(0, pageCount - 1), Math.max(0, Math.floor(page)));
}

/** The slides a page shows: `slidesPerPage` slides from its first, within the slides. */
export function slidesInView(
    pages: readonly number[],
    page: number,
    slideCount: number,
    slidesPerPage: number | undefined,
): number[] {
    const start = pages[clampCarouselPage(page, pages.length)] ?? 0;
    const end = Math.min(slideCount, start + whole(slidesPerPage, 1));
    const slides: number[] = [];
    for (let index = start; index < end; index++) {
        slides.push(index);
    }
    return slides;
}

/**
 * The page a move from `page` reaches (`1` next, `-1` previous), or `null` at an edge; with `loop`
 * the edges wrap.
 */
export function stepCarouselPage(
    page: number,
    pageCount: number,
    step: 1 | -1,
    loop: boolean,
): number | null {
    const next = page + step;
    if (next >= 0 && next < pageCount) {
        return next;
    }
    if (!loop || pageCount < 2) {
        return null;
    }
    return next < 0 ? pageCount - 1 : 0;
}
