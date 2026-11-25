import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { watchAutoRepeat } from "../../src/number/auto-repeat.ts";

function pointer(type: string, pointerType = "mouse"): PointerEvent {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true });
    Object.defineProperties(event, {
        pointerId: { value: 1 },
        pointerType: { value: pointerType },
        isPrimary: { value: true },
    });
    return event as PointerEvent;
}

let element: HTMLButtonElement;

beforeEach(() => {
    vi.useFakeTimers();
    element = document.createElement("button");
    document.body.append(element);
});

afterEach(() => {
    vi.useRealTimers();
    element.remove();
});

// spec/number-field.md, "Pointer": press and hold
describe("watchAutoRepeat", () => {
    it("steps at the press, then every interval once the delay passed, until the release", () => {
        const onStep = vi.fn(() => true);
        const stop = watchAutoRepeat(element, { onStep });
        element.dispatchEvent(pointer("pointerdown"));
        expect(onStep).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(399);
        expect(onStep).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(1 + 60 * 3);
        expect(onStep).toHaveBeenCalledTimes(4);
        document.dispatchEvent(pointer("pointerup"));
        // the click that ends the press (in the same task) steps no more
        element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        vi.advanceTimersByTime(600);
        expect(onStep).toHaveBeenCalledTimes(4);
        stop();
    });

    it("ends a press once, at its release or at a bound, and after a click's single step", () => {
        const onEnd = vi.fn();
        let left = 2;
        const stop = watchAutoRepeat(element, {
            onStep: () => {
                left -= 1;
                return left > 0;
            },
            onEnd,
        });
        element.dispatchEvent(pointer("pointerdown"));
        vi.advanceTimersByTime(400 + 60 * 5);
        expect(onEnd).toHaveBeenCalledTimes(1);
        document.dispatchEvent(pointer("pointerup"));
        expect(onEnd).toHaveBeenCalledTimes(1);
        left = 10;
        element.dispatchEvent(pointer("pointerdown"));
        vi.advanceTimersByTime(400 + 60 * 2);
        document.dispatchEvent(pointer("pointerup"));
        expect(onEnd).toHaveBeenCalledTimes(2);
        vi.advanceTimersByTime(10);
        element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(onEnd).toHaveBeenCalledTimes(3);
        stop();
    });

    it("steps once for a click no press started (the keyboard, assistive technology)", () => {
        const onStep = vi.fn(() => true);
        const stop = watchAutoRepeat(element, { onStep });
        element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(onStep).toHaveBeenCalledTimes(2);
        stop();
    });

    it("stops when a step returns false, when the pointer leaves, and keeps the focus on a mouse press", () => {
        let left = 3;
        const onStep = vi.fn(() => {
            left -= 1;
            return left > 0;
        });
        const stop = watchAutoRepeat(element, { onStep });
        element.dispatchEvent(pointer("pointerdown"));
        vi.advanceTimersByTime(2000);
        expect(onStep).toHaveBeenCalledTimes(3);

        const other = vi.fn(() => true);
        stop();
        const again = watchAutoRepeat(element, { onStep: other });
        element.dispatchEvent(pointer("pointerdown"));
        element.dispatchEvent(pointer("pointerleave"));
        vi.advanceTimersByTime(2000);
        expect(other).toHaveBeenCalledTimes(1);
        const mousedown = new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
        });
        element.dispatchEvent(mousedown);
        expect(mousedown.defaultPrevented).toBe(true);
        again();
    });
});

describe("watchAutoRepeat, a press that sends no click", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it("swallows no later click once the press ended", () => {
        const button = document.createElement("button");
        document.body.append(button);
        const onStep = vi.fn(() => true);
        const stop = watchAutoRepeat(button, { onStep });
        button.dispatchEvent(pointer("pointerdown"));
        // released outside: the release sends no click
        document.dispatchEvent(pointer("pointerup"));
        vi.advanceTimersByTime(1);
        button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(onStep).toHaveBeenCalledTimes(2);
        stop();
        button.remove();
    });
});
