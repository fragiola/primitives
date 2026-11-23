import { describe, expect, it, vi } from "vitest";
import { watchPointerExit } from "../../src/pointer/watch-pointer-exit.ts";

function pointerOut(
    target: Element,
    init: { pointerType: string; relatedTarget: Element | null },
) {
    const event = new MouseEvent("pointerout", {
        bubbles: true,
        relatedTarget: init.relatedTarget,
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
});
