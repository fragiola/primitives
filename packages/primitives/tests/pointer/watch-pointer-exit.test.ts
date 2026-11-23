import { describe, expect, it, vi } from "vitest";
import { watchPointerExit } from "../../src/pointer/watch-pointer-exit.ts";

function pointerOut(
    target: Element,
    init: {
        pointerType: string;
        relatedTarget: Element | null;
        clientX?: number;
        clientY?: number;
    },
) {
    const event = new MouseEvent("pointerout", {
        bubbles: true,
        relatedTarget: init.relatedTarget,
        clientX: init.clientX ?? -1,
        clientY: init.clientY ?? -1,
    });
    Object.defineProperty(event, "pointerType", { value: init.pointerType });
    target.dispatchEvent(event);
}

// Epic #49 (#46): a pointer that leaves the window or the iframe at once sends no move
describe("watchPointerExit", () => {
    it("reports a mouse or pen leaving the document, not a move to another element", () => {
        const a = document.createElement("div");
        const b = document.createElement("div");
        document.body.append(a, b);
        const exit = vi.fn();
        const stop = watchPointerExit(document, exit);

        pointerOut(a, { pointerType: "mouse", relatedTarget: b });
        expect(exit).not.toHaveBeenCalled();
        pointerOut(a, { pointerType: "mouse", relatedTarget: null });
        expect(exit).toHaveBeenCalledOnce();
        pointerOut(a, { pointerType: "pen", relatedTarget: null });
        expect(exit).toHaveBeenCalledTimes(2);
        // a touch ends with a `pointerout` to nowhere: not an exit
        pointerOut(a, { pointerType: "touch", relatedTarget: null });
        expect(exit).toHaveBeenCalledTimes(2);

        stop();
        pointerOut(a, { pointerType: "mouse", relatedTarget: null });
        expect(exit).toHaveBeenCalledTimes(2);
        a.remove();
        b.remove();
    });

    // Epic #49 review: entering an iframe of the page sends a `pointerout` to nowhere too
    it("does not report the pointer entering an iframe of the page", () => {
        const a = document.createElement("div");
        const frame = document.createElement("iframe");
        document.body.append(a, frame);
        const over = { current: frame as Element };
        // jsdom has no layout: the element at a point is the test's
        Object.defineProperty(document, "elementFromPoint", {
            configurable: true,
            value: () => over.current,
        });
        const exit = vi.fn();
        const stop = watchPointerExit(document, exit);

        // inside the viewport, over the iframe: the pointer entered it
        pointerOut(a, {
            pointerType: "mouse",
            relatedTarget: null,
            clientX: 10,
            clientY: 10,
        });
        expect(exit).not.toHaveBeenCalled();
        // outside the viewport: it left
        pointerOut(a, {
            pointerType: "mouse",
            relatedTarget: null,
            clientX: window.innerWidth + 2,
            clientY: 10,
        });
        expect(exit).toHaveBeenCalledOnce();
        // inside the viewport over another element (a quick exit's last point): it left
        over.current = a;
        pointerOut(a, {
            pointerType: "mouse",
            relatedTarget: null,
            clientX: 10,
            clientY: 10,
        });
        expect(exit).toHaveBeenCalledTimes(2);

        stop();
        Reflect.deleteProperty(document, "elementFromPoint");
        a.remove();
        frame.remove();
    });
});
