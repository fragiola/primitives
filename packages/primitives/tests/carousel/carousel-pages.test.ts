import { describe, expect, it } from "vitest";
import {
    carouselPages,
    clampCarouselPage,
    slidesInView,
    stepCarouselPage,
} from "../../src/carousel/carousel-pages.ts";

// spec/carousel.md, "The pages"
describe("carouselPages", () => {
    it("is one page per slide by default", () => {
        expect(carouselPages({ slideCount: 4 })).toEqual([0, 1, 2, 3]);
    });

    it("moves by slidesPerPage unless slidesPerMove says otherwise", () => {
        expect(carouselPages({ slideCount: 6, slidesPerPage: 2 })).toEqual([
            0, 2, 4,
        ]);
        expect(
            carouselPages({
                slideCount: 5,
                slidesPerPage: 2,
                slidesPerMove: 1,
            }),
        ).toEqual([0, 1, 2, 3]);
    });

    it("keeps the last page full", () => {
        expect(
            carouselPages({
                slideCount: 5,
                slidesPerPage: 2,
                slidesPerMove: 2,
            }),
        ).toEqual([0, 2, 3]);
        expect(
            carouselPages({
                slideCount: 7,
                slidesPerPage: 3,
                slidesPerMove: 3,
            }),
        ).toEqual([0, 3, 4]);
    });

    it("has one page when the slides fit on it, or there are none", () => {
        expect(carouselPages({ slideCount: 2, slidesPerPage: 3 })).toEqual([0]);
        expect(carouselPages({ slideCount: 0 })).toEqual([0]);
    });

    it("ignores counts below one", () => {
        expect(
            carouselPages({
                slideCount: 3,
                slidesPerPage: 0,
                slidesPerMove: -1,
            }),
        ).toEqual([0, 1, 2]);
    });
});

describe("clampCarouselPage", () => {
    it("keeps a page within the pages", () => {
        expect(clampCarouselPage(-1, 3)).toBe(0);
        expect(clampCarouselPage(5, 3)).toBe(2);
        expect(clampCarouselPage(1.7, 3)).toBe(1);
        expect(clampCarouselPage(Number.NaN, 3)).toBe(0);
        expect(clampCarouselPage(2, 0)).toBe(0);
    });
});

describe("slidesInView", () => {
    it("is the page's slides", () => {
        const pages = carouselPages({
            slideCount: 5,
            slidesPerPage: 2,
            slidesPerMove: 2,
        });
        expect(slidesInView(pages, 0, 5, 2)).toEqual([0, 1]);
        expect(slidesInView(pages, 2, 5, 2)).toEqual([3, 4]);
        expect(slidesInView([0], 0, 1, 3)).toEqual([0]);
    });
});

describe("stepCarouselPage", () => {
    it("stops at the edges unless it loops", () => {
        expect(stepCarouselPage(0, 3, 1, false)).toBe(1);
        expect(stepCarouselPage(2, 3, 1, false)).toBeNull();
        expect(stepCarouselPage(0, 3, -1, false)).toBeNull();
        expect(stepCarouselPage(2, 3, 1, true)).toBe(0);
        expect(stepCarouselPage(0, 3, -1, true)).toBe(2);
        expect(stepCarouselPage(0, 1, 1, true)).toBeNull();
    });
});
