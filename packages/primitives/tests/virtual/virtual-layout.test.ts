import { describe, expect, it } from "vitest";
import {
    activeSticky,
    pageIndex,
    rowAt,
    rowStarts,
    virtualLayout,
} from "../../src/virtual/virtual-layout.ts";

const fixed = () => 10;

describe("rowStarts and rowAt", () => {
    it("adds the sizes and the gaps, none after the last row", () => {
        expect([
            ...rowStarts(3, (index) => [10, 20, 30][index] ?? 0, 2),
        ]).toEqual([0, 12, 34, 64]);
    });

    it("finds the row at an offset", () => {
        const starts = rowStarts(5, fixed);
        expect(rowAt(starts, 0)).toBe(0);
        expect(rowAt(starts, 9.9)).toBe(0);
        expect(rowAt(starts, 10)).toBe(1);
        expect(rowAt(starts, 1000)).toBe(4);
        expect(rowAt(rowStarts(0, fixed), 0)).toBe(-1);
    });
});

describe("virtualLayout", () => {
    it("renders the rows in view and the overscan, with the room around them", () => {
        const range = virtualLayout({
            count: 10_000,
            size: fixed,
            offset: 500,
            viewport: 50,
            overscan: 2,
        });
        expect(range.visibleStart).toBe(50);
        expect(range.visibleEnd).toBe(54);
        expect(range.rows.map((row) => row.index)).toEqual([
            48, 49, 50, 51, 52, 53, 54, 55, 56,
        ]);
        expect(range.rows[0]?.spaceBefore).toBe(480);
        expect(range.rows.slice(1).every((row) => row.spaceBefore === 0)).toBe(
            true,
        );
        expect(range.spaceAfter).toBe(100_000 - 570);
        expect(range.totalSize).toBe(100_000);
    });

    it("keeps the pinned rows, with the room between them", () => {
        const range = virtualLayout({
            count: 100,
            size: fixed,
            offset: 0,
            viewport: 20,
            overscan: 0,
            pinned: [99, 50, -1, 100, 0.5],
        });
        expect(range.rows.map((row) => [row.index, row.spaceBefore])).toEqual([
            [0, 0],
            [1, 0],
            [50, 480],
            [99, 480],
        ]);
        expect(range.spaceAfter).toBe(0);
    });

    it("leaves the layout's gap between two rendered rows out of their room", () => {
        const range = virtualLayout({
            count: 10,
            size: fixed,
            gap: 2,
            offset: 0,
            viewport: 10,
            overscan: 0,
            pinned: [5],
        });
        // row 5 starts at 60; row 0 ends at 10; the layout adds one gap of 2
        expect(range.rows.map((row) => [row.index, row.spaceBefore])).toEqual([
            [0, 0],
            [5, 48],
        ]);
        expect(range.totalSize).toBe(118);
        expect(range.spaceAfter).toBe(118 - 70);
    });

    it("uses each row's own size (measured sizes)", () => {
        const sizes = [40, 10, 10, 60, 10];
        const range = virtualLayout({
            count: 5,
            size: (index) => sizes[index] ?? 0,
            offset: 55,
            viewport: 10,
            overscan: 0,
        });
        expect(range.visibleStart).toBe(2);
        expect(range.visibleEnd).toBe(3);
        expect(range.rows[0]).toMatchObject({ index: 2, start: 50, size: 10 });
        expect(range.rows[0]?.spaceBefore).toBe(50);
        expect(range.spaceAfter).toBe(10);
    });

    it("clamps an offset past either end", () => {
        expect(
            virtualLayout({
                count: 5,
                size: fixed,
                offset: -100,
                viewport: 10,
                overscan: 0,
            }).visibleStart,
        ).toBe(0);
        expect(
            virtualLayout({
                count: 5,
                size: fixed,
                offset: 10_000,
                viewport: 10,
                overscan: 0,
            }).visibleStart,
        ).toBe(4);
    });

    it("renders only the overscan before the view is known", () => {
        const range = virtualLayout({
            count: 100,
            size: fixed,
            offset: 0,
            viewport: 0,
            overscan: 3,
        });
        expect(range.rows.map((row) => row.index)).toEqual([0, 1, 2, 3]);
    });

    it("is empty without rows", () => {
        expect(
            virtualLayout({ count: 0, size: fixed, offset: 0, viewport: 100 }),
        ).toEqual({
            rows: [],
            spaceAfter: 0,
            totalSize: 0,
            visibleStart: -1,
            visibleEnd: -1,
        });
    });

    it("keeps the group label of the rows in view, marked sticky", () => {
        // groups of 10 rows, each starting with its label
        const sticky = [0, 10, 20, 30];
        const range = virtualLayout({
            count: 40,
            size: fixed,
            offset: 250,
            viewport: 30,
            overscan: 1,
            sticky,
        });
        expect(range.rows.map((row) => [row.index, row.sticky])).toEqual([
            [20, true],
            [24, false],
            [25, false],
            [26, false],
            [27, false],
            [28, false],
        ]);
        expect(range.rows[1]?.spaceBefore).toBe(30);
        expect(activeSticky(sticky, 9)).toBe(0);
        expect(activeSticky(sticky, 10)).toBe(10);
        expect(activeSticky([5], 2)).toBeUndefined();
    });
});

describe("pageIndex", () => {
    const starts = rowStarts(100, fixed);

    it("goes a visible page down and up", () => {
        expect(pageIndex(starts, fixed, 0, 1, 50)).toBe(4);
        expect(pageIndex(starts, fixed, 50, 1, 50)).toBe(54);
        expect(pageIndex(starts, fixed, 50, -1, 50)).toBe(46);
        expect(pageIndex(starts, fixed, 98, 1, 50)).toBe(99);
        expect(pageIndex(starts, fixed, 1, -1, 50)).toBe(0);
    });

    it("goes to an end when the list fits, or its view is not known", () => {
        expect(pageIndex(rowStarts(3, fixed), fixed, 0, 1, 50)).toBe(2);
        expect(pageIndex(starts, fixed, 40, -1, 0)).toBe(0);
        expect(pageIndex(rowStarts(0, fixed), fixed, 0, 1, 50)).toBe(-1);
    });

    it("moves at least one row when a row is taller than the view", () => {
        const tall = () => 100;
        expect(pageIndex(rowStarts(5, tall), tall, 1, 1, 50)).toBe(2);
    });
});
