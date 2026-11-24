import { describe, expect, it } from "vitest";
import {
    colorAreaKeyTarget,
    colorWheelKeyTarget,
    wrapHue,
} from "../../src/color/color-keys.ts";
import { colorChannelRange } from "../../src/color/color-value.ts";
import {
    colorWheelThumbOffset,
    hueAtPoint,
    isOnColorWheel,
} from "../../src/color/color-wheel-geometry.ts";

const options = {
    x: 50,
    y: 40,
    xRange: colorChannelRange("saturation"),
    yRange: colorChannelRange("brightness"),
    rtl: false,
};

// spec/color-area.md and spec/color-wheel.md, "Keyboard" and "Pointer"
describe("colorAreaKeyTarget", () => {
    it("moves x with the horizontal arrows and y with the vertical ones", () => {
        expect(colorAreaKeyTarget("ArrowRight", false, options)).toEqual({
            axis: "x",
            value: 51,
        });
        expect(colorAreaKeyTarget("ArrowLeft", true, options)).toEqual({
            axis: "x",
            value: 40,
        });
        expect(colorAreaKeyTarget("ArrowUp", false, options)).toEqual({
            axis: "y",
            value: 41,
        });
        expect(colorAreaKeyTarget("ArrowDown", true, options)).toEqual({
            axis: "y",
            value: 30,
        });
    });

    it("pages y, sends x home and to its end, swaps the arrows in RTL", () => {
        expect(colorAreaKeyTarget("PageUp", false, options)).toEqual({
            axis: "y",
            value: 50,
        });
        expect(colorAreaKeyTarget("PageDown", false, options)).toEqual({
            axis: "y",
            value: 30,
        });
        expect(colorAreaKeyTarget("Home", false, options)).toEqual({
            axis: "x",
            value: 0,
        });
        expect(colorAreaKeyTarget("End", false, options)).toEqual({
            axis: "x",
            value: 100,
        });
        expect(
            colorAreaKeyTarget("ArrowRight", false, { ...options, rtl: true }),
        ).toEqual({
            axis: "x",
            value: 49,
        });
        expect(colorAreaKeyTarget("a", false, options)).toBeNull();
    });
});

describe("colorWheelKeyTarget", () => {
    it("steps and wraps the hue", () => {
        expect(colorWheelKeyTarget("ArrowRight", false, 90)).toBe(91);
        expect(colorWheelKeyTarget("ArrowUp", false, 359)).toBe(0);
        expect(colorWheelKeyTarget("ArrowLeft", false, 0)).toBe(359);
        expect(colorWheelKeyTarget("ArrowDown", true, 10)).toBe(355);
        expect(colorWheelKeyTarget("PageUp", false, 350)).toBe(5);
        expect(colorWheelKeyTarget("PageDown", false, 90)).toBe(75);
        expect(colorWheelKeyTarget("Home", false, 90)).toBe(0);
        expect(colorWheelKeyTarget("End", false, 90)).toBe(359);
        expect(colorWheelKeyTarget("Enter", false, 90)).toBeNull();
        expect(wrapHue(-0.4)).toBe(0);
        expect(wrapHue(360)).toBe(0);
    });
});

describe("the wheel's geometry", () => {
    const box = { left: 0, top: 0, width: 200, height: 200 };

    it("reads the hue from the top, clockwise", () => {
        expect(hueAtPoint(box, { x: 100, y: 0 })).toBe(0);
        expect(hueAtPoint(box, { x: 200, y: 100 })).toBe(90);
        expect(hueAtPoint(box, { x: 100, y: 200 })).toBe(180);
        expect(hueAtPoint(box, { x: 0, y: 100 })).toBe(270);
    });

    it("knows the ring and places the thumb on it", () => {
        expect(isOnColorWheel(box, { x: 100, y: 10 }, 76, 100)).toBe(true);
        expect(isOnColorWheel(box, { x: 100, y: 100 }, 76, 100)).toBe(false);
        expect(isOnColorWheel(box, { x: 0, y: 0 }, 76, 100)).toBe(false);
        expect(colorWheelThumbOffset(0, 88)).toEqual({ x: 0, y: -88 });
        expect(colorWheelThumbOffset(90, 88)).toEqual({ x: 88, y: 0 });
        expect(colorWheelThumbOffset(180, 88)).toEqual({ x: 0, y: 88 });
    });
});
