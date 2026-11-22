import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { watchLongPress } from "../../src/pointer/long-press.ts";

function pointer(
    type: string,
    options: { x?: number; y?: number; pointerType?: string; id?: number } = {},
): PointerEvent {
    const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: options.x ?? 0,
        clientY: options.y ?? 0,
    });
    Object.defineProperties(event, {
        pointerId: { value: options.id ?? 1 },
        pointerType: { value: options.pointerType ?? "touch" },
        isPrimary: { value: true },
    });
    return event as PointerEvent;
}

let element: HTMLElement;

beforeEach(() => {
    vi.useFakeTimers();
    element = document.createElement("div");
    document.body.append(element);
});

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
});

// spec/context-menu.md, "Pointer": a touch held still for 500 ms opens the menu at the point
describe("watchLongPress", () => {
    it("fires after the delay, at the point the press went down", () => {
        const onLongPress = vi.fn();
        const stop = watchLongPress(element, { onLongPress });
        element.dispatchEvent(pointer("pointerdown", { x: 30, y: 40 }));
        vi.advanceTimersByTime(499);
        expect(onLongPress).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(onLongPress).toHaveBeenCalledOnce();
        expect(onLongPress.mock.calls[0]?.[0]).toEqual({ x: 30, y: 40 });
        stop();
    });

    it("is canceled by a release, a cancel or a move beyond the tolerance", () => {
        const onLongPress = vi.fn();
        const stop = watchLongPress(element, { onLongPress });
        element.dispatchEvent(pointer("pointerdown"));
        vi.advanceTimersByTime(200);
        document.dispatchEvent(pointer("pointerup"));
        vi.advanceTimersByTime(600);
        element.dispatchEvent(pointer("pointerdown"));
        document.dispatchEvent(pointer("pointercancel"));
        vi.advanceTimersByTime(600);
        element.dispatchEvent(pointer("pointerdown"));
        // within the tolerance (10 px), then beyond it
        document.dispatchEvent(pointer("pointermove", { x: 10, y: 0 }));
        vi.advanceTimersByTime(100);
        document.dispatchEvent(pointer("pointermove", { x: 11, y: 0 }));
        vi.advanceTimersByTime(600);
        expect(onLongPress).not.toHaveBeenCalled();
        stop();
    });

    it("ignores the mouse and other pointer types", () => {
        const onLongPress = vi.fn();
        const stop = watchLongPress(element, { onLongPress });
        element.dispatchEvent(pointer("pointerdown", { pointerType: "mouse" }));
        vi.advanceTimersByTime(600);
        expect(onLongPress).not.toHaveBeenCalled();
        const pen = watchLongPress(element, {
            onLongPress,
            pointerTypes: ["pen"],
            delay: 100,
        });
        element.dispatchEvent(pointer("pointerdown", { pointerType: "pen" }));
        vi.advanceTimersByTime(100);
        expect(onLongPress).toHaveBeenCalledOnce();
        pen();
        stop();
    });

    it("swallows the click and contextmenu its release sends", () => {
        const onLongPress = vi.fn();
        const onClick = vi.fn();
        document.body.addEventListener("click", onClick);
        const stop = watchLongPress(element, { onLongPress });
        element.dispatchEvent(pointer("pointerdown"));
        vi.advanceTimersByTime(500);
        const menu = new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
        });
        element.dispatchEvent(menu);
        expect(menu.defaultPrevented).toBe(true);
        document.dispatchEvent(pointer("pointerup"));
        const click = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
        });
        document.body.dispatchEvent(click);
        expect(click.defaultPrevented).toBe(true);
        expect(onClick).not.toHaveBeenCalled();
        // the next click goes through
        document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(onClick).toHaveBeenCalledOnce();
        stop();
    });

    it("stops swallowing a second after the release, or on the next press", () => {
        const onClick = vi.fn();
        document.body.addEventListener("click", onClick);
        const stop = watchLongPress(element, { onLongPress: () => {} });
        element.dispatchEvent(pointer("pointerdown"));
        vi.advanceTimersByTime(500);
        document.dispatchEvent(pointer("pointerup"));
        vi.advanceTimersByTime(1000);
        document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(onClick).toHaveBeenCalledOnce();
        element.dispatchEvent(pointer("pointerdown"));
        vi.advanceTimersByTime(500);
        element.dispatchEvent(pointer("pointerdown", { pointerType: "mouse" }));
        document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(onClick).toHaveBeenCalledTimes(2);
        stop();
    });

    it("watches nothing once stopped", () => {
        const onLongPress = vi.fn();
        const stop = watchLongPress(element, { onLongPress });
        element.dispatchEvent(pointer("pointerdown"));
        stop();
        vi.advanceTimersByTime(600);
        element.dispatchEvent(pointer("pointerdown"));
        vi.advanceTimersByTime(600);
        expect(onLongPress).not.toHaveBeenCalled();
    });
});
