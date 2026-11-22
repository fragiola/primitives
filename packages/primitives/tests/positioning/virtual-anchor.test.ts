import { afterEach, describe, expect, it } from "vitest";
import { virtualAnchor } from "../../src/positioning/virtual-anchor.ts";

afterEach(() => {
    document.body.innerHTML = "";
});

// spec/context-menu.md, "Positioning": a context menu anchors to the point that opened it
describe("virtualAnchor", () => {
    it("is a zero-size rectangle at a point", () => {
        const rect = virtualAnchor({ x: 40, y: 60 }).getBoundingClientRect();
        expect({ ...rect }).toMatchObject({
            x: 40,
            y: 60,
            left: 40,
            top: 60,
            right: 40,
            bottom: 60,
            width: 0,
            height: 0,
        });
    });

    it("is a rectangle, with the element it belongs to", () => {
        const area = document.createElement("div");
        const anchor = virtualAnchor(
            { x: 10, y: 20, width: 30, height: 40 },
            area,
        );
        expect(anchor.contextElement).toBe(area);
        const rect = anchor.getBoundingClientRect();
        expect([rect.right, rect.bottom]).toEqual([40, 60]);
        expect(rect.toJSON()).toMatchObject({ width: 30, height: 40 });
    });

    it("has no context element unless given one", () => {
        expect("contextElement" in virtualAnchor({ x: 0, y: 0 }, null)).toBe(
            false,
        );
    });
});
