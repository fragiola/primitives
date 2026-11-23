import { describe, expect, it } from "vitest";
import {
    MIN_THUMB_SIZE,
    scrollForThumbOffset,
    scrollFromStart,
    thumbGeometry,
} from "../../src/scroll-area/scroll-geometry.ts";

// spec/scroll-area.md, "Measurement"
describe("scrollFromStart", () => {
    it("clamps to the range, and snaps within 1 px of an edge", () => {
        expect(scrollFromStart(50, 100)).toBe(50);
        expect(scrollFromStart(-20, 100)).toBe(0);
        expect(scrollFromStart(130, 100)).toBe(100);
        expect(scrollFromStart(0.6, 100)).toBe(0);
        expect(scrollFromStart(99.4, 100)).toBe(100);
        expect(scrollFromStart(12, 0)).toBe(0);
        // a range of a pixel or less: the nearer edge
        expect(scrollFromStart(0.4, 1)).toBe(0);
        expect(scrollFromStart(0.7, 1)).toBe(1);
    });
});

describe("thumbGeometry", () => {
    it("sizes the thumb by the visible fraction of the room", () => {
        expect(
            thumbGeometry({
                clientSize: 200,
                scrollSize: 800,
                fromStart: 0,
                room: 200,
            }),
        ).toEqual({ size: 50, offset: 0 });
    });

    it("moves it by the scroll's fraction of its range", () => {
        const half = thumbGeometry({
            clientSize: 200,
            scrollSize: 800,
            fromStart: 300,
            room: 200,
        });
        expect(half.offset).toBe(75);
        const end = thumbGeometry({
            clientSize: 200,
            scrollSize: 800,
            fromStart: 600,
            room: 200,
        });
        expect(end.offset + end.size).toBe(200);
    });

    it("keeps a thumb of at least 16 px, and fills a track with nothing to scroll", () => {
        const long = thumbGeometry({
            clientSize: 100,
            scrollSize: 100_000,
            fromStart: 99_900,
            room: 100,
        });
        expect(long.size).toBe(MIN_THUMB_SIZE);
        expect(long.offset).toBe(100 - MIN_THUMB_SIZE);
        expect(
            thumbGeometry({
                clientSize: 300,
                scrollSize: 300,
                fromStart: 0,
                room: 120,
            }),
        ).toEqual({ size: 120, offset: 0 });
    });
});

describe("scrollForThumbOffset", () => {
    it("is the inverse of the thumb's offset, clamped", () => {
        expect(scrollForThumbOffset(75, 150, 600)).toBe(300);
        expect(scrollForThumbOffset(-10, 150, 600)).toBe(0);
        expect(scrollForThumbOffset(400, 150, 600)).toBe(600);
        expect(scrollForThumbOffset(20, 0, 600)).toBe(0);
    });
});
