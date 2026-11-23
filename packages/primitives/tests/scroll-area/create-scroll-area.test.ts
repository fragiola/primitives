import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    createScrollArea,
    normalizeScrollAreaThreshold,
    type ScrollAreaController,
    type ScrollAreaState,
} from "../../src/scroll-area/create-scroll-area.ts";

/** Gives an element the layout jsdom does not compute. */
function layout(element: HTMLElement, metrics: Record<string, number>) {
    for (const [name, value] of Object.entries(metrics)) {
        Object.defineProperty(element, name, {
            configurable: true,
            writable: true,
            value,
        });
    }
}

// spec/scroll-area.md
describe("createScrollArea", () => {
    let root: HTMLElement;
    let viewport: HTMLElement;
    let content: HTMLElement;
    let scrollbarY: HTMLElement;
    let thumbY: HTMLElement;
    let scrollbarX: HTMLElement;
    let thumbX: HTMLElement;
    let states: ScrollAreaState[];
    let controller: ScrollAreaController | null;
    const last = () => states[states.length - 1];

    beforeEach(() => {
        vi.useFakeTimers();
        root = document.createElement("div");
        viewport = document.createElement("div");
        content = document.createElement("div");
        scrollbarY = document.createElement("div");
        thumbY = document.createElement("div");
        scrollbarX = document.createElement("div");
        thumbX = document.createElement("div");
        scrollbarY.append(thumbY);
        scrollbarX.append(thumbX);
        viewport.append(content);
        root.append(viewport, scrollbarY, scrollbarX);
        document.body.append(root);
        layout(viewport, {
            clientHeight: 200,
            scrollHeight: 800,
            clientWidth: 300,
            scrollWidth: 600,
            scrollTop: 0,
            scrollLeft: 0,
        });
        layout(scrollbarY, { offsetHeight: 200, offsetWidth: 10 });
        layout(thumbY, { offsetHeight: 50, offsetWidth: 10 });
        layout(scrollbarX, { offsetHeight: 10, offsetWidth: 300 });
        layout(thumbX, { offsetHeight: 10, offsetWidth: 150 });
        scrollbarY.getBoundingClientRect = () =>
            ({ top: 0, left: 290, right: 300, bottom: 200 }) as DOMRect;
        states = [];
        controller = null;
    });
    afterEach(() => {
        controller?.destroy();
        document.body.replaceChildren();
        vi.useRealTimers();
    });

    const mount = (threshold?: number) => {
        controller = createScrollArea(root, {
            threshold: () => threshold,
            onStateChange: (state) => states.push(state),
        });
        controller.setPart("viewport", viewport);
        controller.setPart("content", content);
        controller.setPart("scrollbar-y", scrollbarY);
        controller.setPart("thumb-y", thumbY);
        controller.setPart("scrollbar-x", scrollbarX);
        controller.setPart("thumb-x", thumbX);
        return controller;
    };

    it("measures the overflow, the edges and the tab stop", () => {
        mount();
        expect(last()).toMatchObject({
            measured: true,
            hasOverflowX: true,
            hasOverflowY: true,
            overflowXStart: false,
            overflowXEnd: true,
            overflowYStart: false,
            overflowYEnd: true,
            focusable: true,
            scrollingX: false,
            scrollingY: false,
        });
        expect(
            viewport.style.getPropertyValue("--scroll-area-overflow-y-end"),
        ).toBe("600px");
        expect(
            viewport.style.getPropertyValue("--scroll-area-overflow-x-end"),
        ).toBe("300px");
        expect(
            scrollbarY.style.getPropertyValue("--scroll-area-thumb-height"),
        ).toBe("50px");
        expect(
            scrollbarX.style.getPropertyValue("--scroll-area-thumb-width"),
        ).toBe("150px");
        expect(root.style.getPropertyValue("--scroll-area-corner-width")).toBe(
            "10px",
        );
        expect(root.style.getPropertyValue("--scroll-area-corner-height")).toBe(
            "10px",
        );
    });

    it("follows a programmatic scroll without `scrolling`", () => {
        mount();
        viewport.scrollTop = 300;
        viewport.dispatchEvent(new Event("scroll"));
        expect(last()).toMatchObject({
            overflowYStart: true,
            overflowYEnd: true,
            scrollingY: false,
        });
        expect(thumbY.style.transform).toBe("translate3d(0px, 75px, 0px)");
        expect(
            viewport.style.getPropertyValue("--scroll-area-overflow-y-start"),
        ).toBe("300px");
    });

    it("sets `scrolling` on a user scroll, for 500 ms after the last", () => {
        mount();
        viewport.dispatchEvent(new Event("wheel"));
        viewport.scrollTop = 600;
        viewport.dispatchEvent(new Event("scroll"));
        expect(last()).toMatchObject({
            scrollingY: true,
            scrollingX: false,
            overflowYEnd: false,
        });
        vi.advanceTimersByTime(499);
        expect(last()?.scrollingY).toBe(true);
        vi.advanceTimersByTime(1);
        expect(last()?.scrollingY).toBe(false);
    });

    it("needs no tab stop when the content holds a focusable element, or nothing overflows", () => {
        const link = document.createElement("a");
        link.href = "#one";
        content.append(link);
        mount();
        expect(last()?.focusable).toBe(false);
        link.remove();
        controller?.update();
        expect(last()?.focusable).toBe(true);
        layout(viewport, { scrollHeight: 200, scrollWidth: 300 });
        controller?.update();
        expect(last()).toMatchObject({
            hasOverflowX: false,
            hasOverflowY: false,
            focusable: false,
        });
    });

    it("reads the threshold, and the RTL edges from the inline start", () => {
        mount(20);
        viewport.scrollTop = 15;
        viewport.dispatchEvent(new Event("scroll"));
        expect(last()?.overflowYStart).toBe(false);
        viewport.scrollTop = 25;
        viewport.dispatchEvent(new Event("scroll"));
        expect(last()?.overflowYStart).toBe(true);

        controller?.destroy();
        root.dir = "rtl";
        viewport.scrollLeft = -100;
        mount();
        expect(last()).toMatchObject({
            overflowXStart: true,
            overflowXEnd: true,
        });
        expect(
            viewport.style.getPropertyValue("--scroll-area-overflow-x-start"),
        ).toBe("100px");
        // the thumb moves toward the left: a negative offset
        expect(thumbX.style.transform).toBe("translate3d(-50px, 0px, 0px)");
    });

    it("drags the thumb: a move of the room left scrolls the whole range", () => {
        mount();
        thumbY.dispatchEvent(
            new PointerEvent("pointerdown", {
                bubbles: true,
                button: 0,
                buttons: 1,
                pointerId: 1,
                clientY: 20,
            }),
        );
        expect(last()?.scrollingY).toBe(true);
        window.dispatchEvent(
            new PointerEvent("pointermove", {
                buttons: 1,
                pointerId: 1,
                clientY: 95,
            }),
        );
        expect(viewport.scrollTop).toBe(300);
        window.dispatchEvent(
            new PointerEvent("pointermove", {
                buttons: 1,
                pointerId: 1,
                clientY: 400,
            }),
        );
        expect(viewport.scrollTop).toBe(600);
        window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1 }));
        expect(last()?.scrollingY).toBe(false);
    });

    it("presses the track: the thumb's center goes under the pointer", () => {
        mount();
        const press = new PointerEvent("pointerdown", {
            bubbles: true,
            cancelable: true,
            button: 0,
            buttons: 1,
            pointerId: 2,
            clientY: 100,
        });
        scrollbarY.dispatchEvent(press);
        // (100 - 25) / (200 - 50) of the range
        expect(viewport.scrollTop).toBe(300);
        const mouse = new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
        });
        scrollbarY.dispatchEvent(mouse);
        expect(mouse.defaultPrevented).toBe(true);
    });

    it("reports the hover of a mouse, never a touch's", () => {
        mount();
        root.dispatchEvent(
            new PointerEvent("pointermove", { pointerType: "mouse" }),
        );
        expect(last()?.hovering).toBe(true);
        root.dispatchEvent(new PointerEvent("pointerleave"));
        expect(last()?.hovering).toBe(false);
        root.dispatchEvent(
            new PointerEvent("pointermove", { pointerType: "touch" }),
        );
        expect(last()?.hovering).toBe(false);
    });

    it("stops reporting once destroyed", () => {
        const scrollArea = mount();
        const count = states.length;
        scrollArea.destroy();
        viewport.scrollTop = 300;
        viewport.dispatchEvent(new Event("scroll"));
        expect(states).toHaveLength(count);
    });
});

describe("normalizeScrollAreaThreshold", () => {
    it("takes a number or edges, each at least 0", () => {
        expect(normalizeScrollAreaThreshold(4)).toEqual({
            xStart: 4,
            xEnd: 4,
            yStart: 4,
            yEnd: 4,
        });
        expect(normalizeScrollAreaThreshold({ yEnd: 8, xStart: -2 })).toEqual({
            xStart: 0,
            xEnd: 0,
            yStart: 0,
            yEnd: 8,
        });
        expect(normalizeScrollAreaThreshold(undefined)).toEqual({
            xStart: 0,
            xEnd: 0,
            yStart: 0,
            yEnd: 0,
        });
    });
});
