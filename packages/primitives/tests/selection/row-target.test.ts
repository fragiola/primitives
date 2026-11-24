import { describe, expect, it } from "vitest";
import { rowTarget } from "../../src/selection/row-target.ts";

/** `count` 20 px boxes laid out `columns` per row, 4 px apart. */
function grid(count: number, columns: number, rtl = false) {
    return Array.from({ length: count }, (_, index) => {
        const element = document.createElement("div");
        const column = index % columns;
        const row = Math.floor(index / columns);
        const left = (rtl ? columns - 1 - column : column) * 24;
        element.getBoundingClientRect = () =>
            ({
                top: row * 24,
                bottom: row * 24 + 20,
                left,
                right: left + 20,
            }) as DOMRect;
        return element;
    });
}

describe("rowTarget", () => {
    it("moves to the option below or above, in the same column", () => {
        const elements = grid(8, 4);
        expect(rowTarget(elements, 1, 1)).toBe(5);
        expect(rowTarget(elements, 6, -1)).toBe(2);
    });

    it("stays on the first and last rows", () => {
        const elements = grid(8, 4);
        expect(rowTarget(elements, 2, -1)).toBe(2);
        expect(rowTarget(elements, 7, 1)).toBe(7);
    });

    it("lands on the nearest option of a shorter last row", () => {
        const elements = grid(6, 4);
        expect(rowTarget(elements, 3, 1)).toBe(5);
        expect(rowTarget(elements, 0, 1)).toBe(4);
    });

    it("skips to the nearest row only, and measures columns in RTL too", () => {
        const elements = grid(12, 4, true);
        expect(rowTarget(elements, 1, 1)).toBe(5);
        expect(rowTarget(elements, 9, -1)).toBe(5);
    });

    it("is -1 for an index with no option", () => {
        expect(rowTarget(grid(4, 4), 9, 1)).toBe(-1);
    });
});
