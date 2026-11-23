import { describe, expect, it } from "vitest";
import { pageTarget } from "../../src/selection/page-target.ts";

/** A list of `count` 20 px rows in a container `visible` px tall that scrolls `total` px. */
function rows(count: number, visible: number, total: number) {
    const container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: visible });
    Object.defineProperty(container, "scrollHeight", { value: total });
    const elements = Array.from({ length: count }, (_, index) => {
        const element = document.createElement("div");
        element.getBoundingClientRect = () =>
            ({
                top: index * 20,
                bottom: index * 20 + 20,
                left: 0,
                right: 100,
            }) as DOMRect;
        return element;
    });
    return { container, elements };
}

describe("pageTarget", () => {
    it("goes to the last or first option when the list does not scroll", () => {
        const { container, elements } = rows(5, 100, 100);
        expect(pageTarget(elements, 1, 1, container)).toBe(4);
        expect(pageTarget(elements, 3, -1, container)).toBe(0);
    });

    it("goes a visible height away when the list scrolls", () => {
        const { container, elements } = rows(20, 60, 400);
        // rows 2, 3, 4 end within 60 px of row 2's top
        expect(pageTarget(elements, 2, 1, container)).toBe(4);
        expect(pageTarget(elements, 10, -1, container)).toBe(8);
        expect(pageTarget(elements, 19, 1, container)).toBe(19);
        expect(pageTarget(elements, 0, -1, container)).toBe(0);
    });
});
