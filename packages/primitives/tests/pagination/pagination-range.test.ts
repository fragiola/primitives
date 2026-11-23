import { describe, expect, it } from "vitest";
import {
    clampPage,
    type PaginationItem,
    pageCount,
    paginationRange,
} from "../../src/pagination/pagination-range.ts";

/** A range written as the spec writes it: `1 … 4 5 6 … 10`. */
function written(items: PaginationItem[]): string {
    return items
        .map((item) => (item.type === "page" ? String(item.value) : "…"))
        .join(" ");
}

const range = (
    page: number,
    count: number,
    siblingCount?: number,
    boundaryCount?: number,
) => written(paginationRange({ page, count, siblingCount, boundaryCount }));

// spec/pagination.md, "The range"
describe("paginationRange", () => {
    it("shows every page while they fit", () => {
        expect(range(1, 1)).toBe("1");
        expect(range(2, 5)).toBe("1 2 3 4 5");
        // 2 × 1 + 2 × 1 + 3 = 7 slots
        expect(range(4, 7)).toBe("1 2 3 4 5 6 7");
    });

    it("keeps the window whole near the edges, with defaults of 1 and 1", () => {
        expect(range(1, 10)).toBe("1 2 3 4 5 … 10");
        expect(range(3, 10)).toBe("1 2 3 4 5 … 10");
        expect(range(4, 10)).toBe("1 2 3 4 5 … 10");
        expect(range(5, 10)).toBe("1 … 4 5 6 … 10");
        expect(range(6, 10)).toBe("1 … 5 6 7 … 10");
        expect(range(7, 10)).toBe("1 … 6 7 8 9 10");
        expect(range(10, 10)).toBe("1 … 6 7 8 9 10");
    });

    it("never has an ellipsis that hides a single page", () => {
        expect(range(1, 8)).toBe("1 2 3 4 5 … 8");
        expect(range(4, 8)).toBe("1 2 3 4 5 … 8");
        expect(range(5, 8)).toBe("1 … 4 5 6 7 8");
        for (let count = 1; count <= 30; count++) {
            for (let page = 1; page <= count; page++) {
                const items = paginationRange({ page, count });
                items.forEach((item, index) => {
                    if (item.type !== "ellipsis") {
                        return;
                    }
                    const before = items[index - 1];
                    const after = items[index + 1];
                    const gap =
                        (after?.type === "page" ? after.value : count + 1) -
                        (before?.type === "page" ? before.value : 0);
                    expect(gap, `${page} of ${count}`).toBeGreaterThan(2);
                });
            }
        }
    });

    it("always has the same number of items once they do not fit", () => {
        for (const [siblings, boundary] of [
            [0, 0],
            [1, 1],
            [2, 0],
            [0, 2],
            [2, 2],
        ] as const) {
            const slots = 2 * boundary + 2 * siblings + 3;
            for (let page = 1; page <= 40; page++) {
                expect(
                    paginationRange({
                        page,
                        count: 40,
                        siblingCount: siblings,
                        boundaryCount: boundary,
                    }),
                ).toHaveLength(slots);
            }
        }
    });

    it("shows the current page and its siblings, in order, with no duplicate", () => {
        for (let page = 1; page <= 25; page++) {
            const items = paginationRange({ page, count: 25, siblingCount: 2 });
            const pages = items.flatMap((item) =>
                item.type === "page" ? [item.value] : [],
            );
            expect(pages).toEqual([...pages].sort((a, b) => a - b));
            expect(new Set(pages).size).toBe(pages.length);
            for (const value of [
                page - 2,
                page - 1,
                page,
                page + 1,
                page + 2,
            ]) {
                if (value >= 1 && value <= 25) {
                    expect(pages).toContain(value);
                }
            }
            expect(pages).toContain(1);
            expect(pages).toContain(25);
        }
    });

    it("takes sibling and boundary counts", () => {
        expect(range(10, 20, 2)).toBe("1 … 8 9 10 11 12 … 20");
        expect(range(10, 20, 0)).toBe("1 … 10 … 20");
        expect(range(10, 20, 1, 2)).toBe("1 2 … 9 10 11 … 19 20");
        expect(range(1, 20, 1, 2)).toBe("1 2 3 4 5 6 … 19 20");
        expect(range(5, 10, 1, 0)).toBe("… 4 5 6 …");
        expect(range(1, 10, 2, 0)).toBe("1 2 3 4 5 6 …");
        expect(range(6, 10, 2, 0)).toBe("… 4 5 6 7 8 …");
        expect(range(10, 10, 2, 0)).toBe("… 5 6 7 8 9 10");
    });

    it("names its ellipses by their side", () => {
        expect(
            paginationRange({ page: 5, count: 10 }).filter(
                (item) => item.type === "ellipsis",
            ),
        ).toEqual([
            { type: "ellipsis", position: "start" },
            { type: "ellipsis", position: "end" },
        ]);
    });

    it("clamps the page and the counts", () => {
        expect(range(0, 10)).toBe(range(1, 10));
        expect(range(99, 10)).toBe(range(10, 10));
        expect(range(Number.NaN, 3)).toBe("1 2 3");
        expect(range(1, 0)).toBe("1");
        expect(range(2, 3, -1, -1)).toBe("1 2 3");
    });
});

describe("pageCount", () => {
    it("is the count, or the rows over the page size, at least 1", () => {
        expect(pageCount({ count: 7 })).toBe(7);
        expect(pageCount({ count: 0 })).toBe(1);
        expect(pageCount({ total: 95, pageSize: 10 })).toBe(10);
        expect(pageCount({ total: 100, pageSize: 10 })).toBe(10);
        expect(pageCount({ total: 101 })).toBe(11);
        expect(pageCount({ total: 0, pageSize: 10 })).toBe(1);
        expect(pageCount({})).toBe(1);
        expect(pageCount({ total: 5, pageSize: 0 })).toBe(5);
    });
});

describe("clampPage", () => {
    it("keeps a page within [1, count]", () => {
        expect(clampPage(4, 10)).toBe(4);
        expect(clampPage(0, 10)).toBe(1);
        expect(clampPage(12, 10)).toBe(10);
        expect(clampPage(2.7, 10)).toBe(2);
    });
});
