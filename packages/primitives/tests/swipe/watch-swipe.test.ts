import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { watchSwipe } from "../../src/swipe/watch-swipe.ts";

let time = 0;

function pointer(
    type: string,
    options: {
        x?: number;
        y?: number;
        pointerType?: string;
        id?: number;
        button?: number;
        primary?: boolean;
        at?: number;
    } = {},
): PointerEvent {
    const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: options.x ?? 0,
        clientY: options.y ?? 0,
        button: options.button ?? 0,
    });
    if (options.at !== undefined) {
        time = options.at;
    }
    Object.defineProperties(event, {
        pointerId: { value: options.id ?? 1 },
        pointerType: { value: options.pointerType ?? "mouse" },
        isPrimary: { value: options.primary ?? true },
        timeStamp: { value: time },
    });
    return event as PointerEvent;
}

let element: HTMLElement;

beforeEach(() => {
    time = 0;
    element = document.createElement("div");
    element.innerHTML = `
        <p id="text">Text</p>
        <button id="button" type="button">Button</button>
        <input id="input" />
        <div id="ignored" data-swipe-ignore><span id="inner">x</span></div>
        <div id="scroller" style="overflow-y: auto"><span id="row">row</span></div>
    `;
    document.body.append(element);
    // jsdom has no pointer capture
    element.setPointerCapture = vi.fn();
    element.releasePointerCapture = vi.fn();
    element.hasPointerCapture = vi.fn(() => true);
});

afterEach(() => {
    document.body.innerHTML = "";
});

function setup(directions: ("up" | "down" | "left" | "right")[] = ["down"]) {
    const calls = {
        onStart: vi.fn(),
        onMove: vi.fn(),
        onEnd: vi.fn(),
    };
    const stop = watchSwipe(element, { directions, ...calls });
    return { ...calls, stop };
}

function press(id: string, options: Parameters<typeof pointer>[1] = {}) {
    document.getElementById(id)?.dispatchEvent(pointer("pointerdown", options));
}

const move = (options: Parameters<typeof pointer>[1]) =>
    window.dispatchEvent(pointer("pointermove", options));
const up = (options: Parameters<typeof pointer>[1]) =>
    window.dispatchEvent(pointer("pointerup", options));

// spec/drawer.md, "Swipe"
describe("watchSwipe", () => {
    it("starts once the pointer moved 6 px along the axis, with capture", () => {
        const { onStart, onMove, stop } = setup();
        press("text", { x: 10, y: 10 });
        move({ x: 10, y: 15 });
        expect(onStart).not.toHaveBeenCalled();
        move({ x: 11, y: 20 });
        expect(onStart).toHaveBeenCalledOnce();
        expect(element.setPointerCapture).toHaveBeenCalledWith(1);
        expect(onMove).toHaveBeenLastCalledWith(
            { deltaX: 1, deltaY: 10 },
            expect.anything(),
        );
        move({ x: 11, y: 4 });
        expect(onMove).toHaveBeenLastCalledWith(
            { deltaX: 1, deltaY: -6 },
            expect.anything(),
        );
        stop();
    });

    it("lets a move along the other axis go", () => {
        const { onStart, onEnd, stop } = setup();
        press("text", { x: 10, y: 10 });
        move({ x: 30, y: 14 });
        move({ x: 30, y: 60 });
        up({ x: 30, y: 60 });
        expect(onStart).not.toHaveBeenCalled();
        expect(onEnd).not.toHaveBeenCalled();
        stop();
    });

    it("reports the release with its velocity over the last moves", () => {
        const { onEnd, stop } = setup();
        press("text", { x: 0, y: 0, at: 0 });
        move({ y: 10, at: 20 });
        move({ y: 30, at: 40 });
        move({ y: 50, at: 60 });
        up({ y: 50, at: 70 });
        expect(onEnd).toHaveBeenCalledOnce();
        const [result] = onEnd.mock.calls[0] as [Record<string, number>];
        expect(result.deltaY).toBe(50);
        expect(result.velocityY).toBeCloseTo(50 / 60);
        expect(result.velocityX).toBe(0);
        stop();
    });

    it("a release at rest has no velocity", () => {
        const { onEnd, stop } = setup();
        press("text", { at: 0 });
        move({ y: 40, at: 20 });
        up({ y: 40, at: 200 });
        expect(onEnd.mock.calls[0]?.[0]).toMatchObject({
            deltaY: 40,
            velocityY: 0,
        });
        stop();
    });

    it("never starts from a text control, an ignored element, or (mouse) a button", () => {
        const { onStart, stop } = setup();
        for (const id of ["input", "inner", "button"]) {
            press(id, { y: 0 });
            move({ y: 40 });
            up({ y: 40 });
        }
        expect(onStart).not.toHaveBeenCalled();
        // a touch may swipe from a button
        press("button", { y: 0, pointerType: "touch" });
        move({ y: 40, pointerType: "touch" });
        expect(onStart).toHaveBeenCalledOnce();
        stop();
    });

    it("takes the primary button and pointer only", () => {
        const { onStart, stop } = setup();
        press("text", { button: 2 });
        move({ y: 40 });
        up({ y: 40 });
        press("text", { primary: false, id: 2 });
        move({ y: 40, id: 2 });
        expect(onStart).not.toHaveBeenCalled();
        stop();
    });

    it("lets a scroller that is not at its edge take the move (scroll containment)", () => {
        const scroller = document.getElementById("scroller") as HTMLElement;
        Object.defineProperties(scroller, {
            scrollHeight: { value: 500 },
            clientHeight: { value: 100 },
        });
        scroller.scrollTop = 50;
        const { onStart, stop } = setup();
        press("row", { y: 0 });
        move({ y: 20 });
        up({ y: 20 });
        expect(onStart).not.toHaveBeenCalled();
        // at its top, a move down swipes
        scroller.scrollTop = 0;
        press("row", { y: 0 });
        move({ y: 20 });
        expect(onStart).toHaveBeenCalledOnce();
        stop();
    });

    it("a cancel, or the cleanup, ends a running swipe with null", () => {
        const { onEnd, stop } = setup(["right"]);
        press("text", { x: 0 });
        move({ x: 20 });
        window.dispatchEvent(pointer("pointercancel"));
        expect(onEnd).toHaveBeenLastCalledWith(null, expect.anything());
        press("text", { x: 0 });
        move({ x: 20 });
        stop();
        expect(onEnd).toHaveBeenLastCalledWith(null, null);
        expect(onEnd).toHaveBeenCalledTimes(2);
    });

    it("keeps a touch that may be a swipe from scrolling the page", () => {
        const { stop } = setup();
        press("text", { y: 0, pointerType: "touch" });
        const touch = (y: number, x = 0) => {
            const event = new Event("touchmove", {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(event, "touches", {
                value: [{ clientX: x, clientY: y }],
            });
            document.getElementById("text")?.dispatchEvent(event);
            return event;
        };
        expect(touch(1).defaultPrevented).toBe(false);
        expect(touch(3).defaultPrevented).toBe(true);
        expect(touch(2, 10).defaultPrevented).toBe(false);
        expect(touch(3, 3).defaultPrevented).toBe(false);
        stop();
    });

    it("keeps text selection off while it runs", () => {
        const { stop } = setup();
        press("text", { y: 0 });
        move({ y: 20 });
        expect(document.documentElement.style.userSelect).toBe("none");
        up({ y: 20 });
        expect(document.documentElement.style.userSelect).toBe("");
        stop();
    });

    it("takes the cleanup's canStart rule", () => {
        const onStart = vi.fn();
        const stop = watchSwipe(element, {
            directions: ["down"],
            canStart: (target) => target.id !== "text",
            onStart,
            onMove: () => {},
            onEnd: () => {},
        });
        press("text", { y: 0 });
        move({ y: 20 });
        expect(onStart).not.toHaveBeenCalled();
        stop();
    });
});

describe("watchSwipe and pointer capture", () => {
    it("a touch's implicit capture lost by a child does not end the swipe", async () => {
        const { onEnd, stop } = setup();
        press("text", { y: 0, pointerType: "touch" });
        move({ y: 20, pointerType: "touch" });
        document
            .getElementById("text")
            ?.dispatchEvent(new Event("lostpointercapture", { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(onEnd).not.toHaveBeenCalled();
        element.dispatchEvent(new Event("lostpointercapture"));
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(onEnd).toHaveBeenCalledWith(null, expect.anything());
        stop();
    });
});
