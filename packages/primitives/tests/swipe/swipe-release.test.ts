import { describe, expect, it } from "vitest";
import {
    resolveSnapPoints,
    swipeDisplacement,
    swipeMovement,
    swipeProgress,
    swipeRelease,
} from "../../src/swipe/swipe-release.ts";

const end = (deltaY: number, velocityY = 0, deltaX = 0, velocityX = 0) => ({
    deltaX,
    deltaY,
    velocityX,
    velocityY,
});

// spec/drawer.md, "Snap points"
describe("resolveSnapPoints", () => {
    it("measures fractions of the viewport, px and rem, clamped to the popup", () => {
        expect(
            resolveSnapPoints([0.5, 200, "10rem", "300px", 1], {
                popupHeight: 600,
                viewportHeight: 800,
            }),
        ).toEqual([
            { value: 0.5, height: 400, offset: 200 },
            { value: 200, height: 200, offset: 400 },
            { value: "10rem", height: 160, offset: 440 },
            { value: "300px", height: 300, offset: 300 },
            { value: 1, height: 600, offset: 0 },
        ]);
    });

    it("leaves out invalid points and counts points within 1 px once (the later one)", () => {
        expect(
            resolveSnapPoints(["50%", -1, Number.NaN, 300, "300.5px"], {
                popupHeight: 600,
                viewportHeight: 800,
                rootFontSize: 10,
            }),
        ).toEqual([{ value: "300.5px", height: 300.5, offset: 299.5 }]);
    });

    it("has no point before the popup or the viewport is measured", () => {
        expect(
            resolveSnapPoints([0.5], { popupHeight: 0, viewportHeight: 800 }),
        ).toEqual([]);
    });
});

describe("swipeDisplacement and swipeMovement", () => {
    it("is positive towards the edge the direction dismisses to", () => {
        const movement = { deltaX: -30, deltaY: 40 };
        expect(swipeDisplacement("down", movement)).toBe(40);
        expect(swipeDisplacement("up", movement)).toBe(-40);
        expect(swipeDisplacement("left", movement)).toBe(30);
        expect(swipeDisplacement("right", movement)).toBe(-30);
    });

    it("follows the pointer towards the edge, on the direction's axis only", () => {
        expect(swipeMovement("down", { deltaX: 12, deltaY: 50 })).toEqual({
            x: 0,
            y: 50,
        });
        expect(swipeMovement("left", { deltaX: -50, deltaY: 9 })).toEqual({
            x: -50,
            y: 0,
        });
    });

    it("is damped past the fully open position", () => {
        // pulled up by 100 px on a bottom drawer: the square root
        expect(swipeMovement("down", { deltaX: 0, deltaY: -100 })).toEqual({
            x: 0,
            y: -10,
        });
        // from a snap point 200 px down, linear until fully open, then damped
        expect(swipeMovement("down", { deltaX: 0, deltaY: -150 }, 200).y).toBe(
            -150,
        );
        expect(swipeMovement("down", { deltaX: 0, deltaY: -264 }, 200).y).toBe(
            -208,
        );
    });

    it("reports the progress towards closed", () => {
        expect(swipeProgress("down", { deltaX: 0, deltaY: 100 }, 400)).toBe(
            0.25,
        );
        expect(
            swipeProgress("down", { deltaX: 0, deltaY: 100 }, 400, 200),
        ).toBe(0.75);
        expect(swipeProgress("right", { deltaX: -40, deltaY: 0 }, 400)).toBe(0);
        expect(swipeProgress("down", { deltaX: 0, deltaY: 100 }, 0)).toBe(0);
    });
});

// spec/drawer.md, "Swipe": the release
describe("swipeRelease without snap points", () => {
    it("dismisses past half the size, settles back before", () => {
        expect(swipeRelease("down", end(201), 400)).toEqual({ dismiss: true });
        expect(swipeRelease("down", end(199), 400)).toEqual({
            dismiss: false,
            snapPoint: null,
        });
    });

    it("dismisses a flick of 10 px or more at 0.5 px/ms towards the edge", () => {
        expect(swipeRelease("down", end(30, 0.6), 400)).toEqual({
            dismiss: true,
        });
        expect(swipeRelease("down", end(30, 0.4), 400).dismiss).toBe(false);
        expect(swipeRelease("down", end(8, 2), 400).dismiss).toBe(false);
        // towards the other edge: never
        expect(swipeRelease("down", end(-300, -3), 400).dismiss).toBe(false);
    });

    it("reads the direction's own axis", () => {
        expect(swipeRelease("left", end(0, 0, -250), 400)).toEqual({
            dismiss: true,
        });
        expect(swipeRelease("right", end(300, 3, -250), 400).dismiss).toBe(
            false,
        );
    });
});

describe("swipeRelease with snap points", () => {
    const points = resolveSnapPoints([0.25, 0.5, 1], {
        popupHeight: 800,
        viewportHeight: 800,
    });
    // offsets 600, 400, 0; closed at 800

    it("settles on the closest point to where it was let go", () => {
        expect(
            swipeRelease("down", end(-250), 800, {
                points,
                currentOffset: 400,
            }),
        ).toEqual({ dismiss: false, snapPoint: 2 });
        expect(
            swipeRelease("down", end(150), 800, { points, currentOffset: 400 }),
        ).toEqual({ dismiss: false, snapPoint: 0 });
        expect(
            swipeRelease("down", end(50), 800, { points, currentOffset: 400 }),
        ).toEqual({ dismiss: false, snapPoint: 1 });
    });

    it("dismisses when closed is closer than every point", () => {
        expect(
            swipeRelease("down", end(120), 800, { points, currentOffset: 600 }),
        ).toEqual({ dismiss: true });
    });

    it("projects a flick's velocity", () => {
        // 0.6 px/ms down from the middle: 50 + 180 past it, the lowest point
        expect(
            swipeRelease("down", end(50, 0.6), 800, {
                points,
                currentOffset: 400,
            }),
        ).toEqual({ dismiss: false, snapPoint: 0 });
        // a fast flick up from the lowest point reaches the top
        expect(
            swipeRelease("down", end(-60, -2), 800, {
                points,
                currentOffset: 600,
            }),
        ).toEqual({ dismiss: false, snapPoint: 2 });
        // a fast flick down from the lowest point closes it
        expect(
            swipeRelease("down", end(20, 1), 800, {
                points,
                currentOffset: 600,
            }),
        ).toEqual({ dismiss: true });
    });
});
