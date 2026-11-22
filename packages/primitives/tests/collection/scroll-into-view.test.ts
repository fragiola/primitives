import { describe, expect, it } from "vitest";
import { scrollIntoViewWithin } from "../../src/collection/scroll-into-view.ts";

function box(element: HTMLElement, top: number, height: number) {
    element.getBoundingClientRect = () =>
        ({ top, bottom: top + height, height }) as DOMRect;
}

describe("scrollIntoViewWithin", () => {
    function setup() {
        const page = document.createElement("div");
        const list = document.createElement("div");
        const item = document.createElement("div");
        list.append(item);
        page.append(list);
        document.body.append(page);
        for (const element of [page, list]) {
            element.style.overflowY = "auto";
            Object.defineProperty(element, "scrollHeight", { value: 500 });
            Object.defineProperty(element, "clientHeight", { value: 100 });
        }
        box(page, 0, 100);
        box(list, 0, 100);
        return { page, list, item };
    }

    it("scrolls the list to the nearest edge, never past the boundary", () => {
        const { page, list, item } = setup();
        box(item, 150, 20);
        scrollIntoViewWithin(item, list);
        expect(list.scrollTop).toBe(70);
        expect(page.scrollTop).toBe(0);
        box(item, -30, 20);
        scrollIntoViewWithin(item, list);
        expect(list.scrollTop).toBe(40);
        page.remove();
    });

    it("leaves an item in view, or outside the boundary, alone", () => {
        const { page, list, item } = setup();
        box(item, 20, 20);
        scrollIntoViewWithin(item, list);
        expect(list.scrollTop).toBe(0);
        box(item, 150, 20);
        scrollIntoViewWithin(item, document.createElement("div"));
        scrollIntoViewWithin(item, null);
        expect(list.scrollTop).toBe(0);
        page.remove();
    });
});
