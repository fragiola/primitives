import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { watchScrub } from "../../src/number/scrub.ts";

function pointer(type: string, x: number, y = 0): PointerEvent {
    const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
    });
    Object.defineProperties(event, {
        pointerId: { value: 1 },
        pointerType: { value: "touch" },
        isPrimary: { value: true },
    });
    return event as PointerEvent;
}

let element: HTMLElement;

beforeEach(() => {
    element = document.createElement("span");
    document.body.append(element);
});

afterEach(() => {
    element.remove();
});

// spec/number-field.md, "Scrub"
describe("watchScrub", () => {
    it("reports a step per sensitivity moved along the axis, until the release", () => {
        const onScrub = vi.fn();
        const onEnd = vi.fn();
        const stop = watchScrub(element, {
            onStart: () => true,
            onScrub,
            onEnd,
        });
        const down = pointer("pointerdown", 100);
        element.dispatchEvent(down);
        expect(down.defaultPrevented).toBe(true);
        document.dispatchEvent(pointer("pointermove", 101));
        expect(onScrub).not.toHaveBeenCalled();
        document.dispatchEvent(pointer("pointermove", 107));
        expect(onScrub).toHaveBeenLastCalledWith(3, expect.anything());
        document.dispatchEvent(pointer("pointermove", 103));
        expect(onScrub).toHaveBeenLastCalledWith(-1, expect.anything());
        document.dispatchEvent(pointer("pointerup", 103));
        expect(onEnd).toHaveBeenCalledTimes(1);
        document.dispatchEvent(pointer("pointermove", 200));
        expect(onScrub).toHaveBeenCalledTimes(2);
        stop();
    });

    it("scrubs up as positive when vertical, and starts nothing onStart refuses", () => {
        const onScrub = vi.fn();
        const stop = watchScrub(element, {
            direction: "vertical",
            pixelSensitivity: 5,
            onStart: () => true,
            onScrub,
            onEnd: () => {},
        });
        element.dispatchEvent(pointer("pointerdown", 0, 100));
        document.dispatchEvent(pointer("pointermove", 0, 90));
        expect(onScrub).toHaveBeenLastCalledWith(2, expect.anything());
        document.dispatchEvent(pointer("pointerup", 0, 90));
        stop();

        const refused = vi.fn();
        const none = watchScrub(element, {
            onStart: () => false,
            onScrub: refused,
            onEnd: () => {},
        });
        element.dispatchEvent(pointer("pointerdown", 0));
        document.dispatchEvent(pointer("pointermove", 50));
        expect(refused).not.toHaveBeenCalled();
        none();
    });
});
