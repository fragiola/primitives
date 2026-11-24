import { describe, expect, it } from "vitest";
import {
    colorAreaBackground,
    colorChannelGradient,
    colorWheelGradient,
} from "../../src/color/color-gradient.ts";
import type { Color } from "../../src/color/color-value.ts";

const hsl: Color = {
    space: "hsl",
    hue: 210,
    saturation: 50,
    lightness: 40,
    alpha: 0.5,
};
const hsb: Color = {
    space: "hsb",
    hue: 210,
    saturation: 50,
    brightness: 40,
    alpha: 1,
};
const rgb: Color = { space: "rgb", red: 10, green: 20, blue: 30, alpha: 1 };

// spec/color.md, "Gradients"
describe("colorChannelGradient", () => {
    it("draws every hue at full saturation", () => {
        expect(colorChannelGradient(hsl, "hue")).toBe(
            "linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))",
        );
        expect(colorChannelGradient(hsb, "hue", "to top")).toMatch(
            /^linear-gradient\(to top, hsl\(0, 100%, 50%\), /,
        );
    });

    it("keeps the other channels, opaque, for the others", () => {
        expect(colorChannelGradient(hsl, "saturation", "to left")).toBe(
            "linear-gradient(to left, hsl(210, 0%, 40%), hsl(210, 100%, 40%))",
        );
        expect(colorChannelGradient(hsl, "lightness")).toBe(
            "linear-gradient(to right, hsl(210, 50%, 0%), hsl(210, 50%, 50%), hsl(210, 50%, 100%))",
        );
        expect(colorChannelGradient(rgb, "green")).toBe(
            "linear-gradient(to right, rgb(10, 0, 30), rgb(10, 255, 30))",
        );
        expect(colorChannelGradient(hsl, "alpha")).toBe(
            "linear-gradient(to right, hsla(210, 50%, 40%, 0), hsl(210, 50%, 40%))",
        );
    });

    it("refuses a channel of another space", () => {
        expect(() => colorChannelGradient(rgb, "hue")).toThrow(RangeError);
    });
});

describe("colorAreaBackground", () => {
    it("adds two rgb channels through screen", () => {
        expect(colorAreaBackground(rgb, "red", "green")).toEqual({
            backgroundImage:
                "linear-gradient(to right, rgb(0, 0, 30), rgb(255, 0, 30)), linear-gradient(to top, rgb(0, 0, 0), rgb(0, 255, 0))",
            backgroundBlendMode: "screen",
        });
    });

    it("shades a saturation ramp with black for brightness", () => {
        expect(colorAreaBackground(hsb, "saturation", "brightness")).toEqual({
            backgroundImage:
                "linear-gradient(to top, rgb(0, 0, 0), rgba(0, 0, 0, 0)), linear-gradient(to right, hsl(210, 0%, 100%), hsl(210, 100%, 50%))",
            backgroundBlendMode: "normal",
        });
    });

    it("shades with black and white for lightness, and runs x from the right in RTL", () => {
        expect(
            colorAreaBackground(hsl, "saturation", "lightness", true),
        ).toEqual({
            backgroundImage:
                "linear-gradient(to top, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 50%, rgba(255, 255, 255, 0) 50%, rgb(255, 255, 255) 100%), linear-gradient(to left, hsl(210, 0%, 50%), hsl(210, 100%, 50%))",
            backgroundBlendMode: "normal",
        });
    });

    it("fades a hue ramp to gray along saturation", () => {
        const { backgroundImage } = colorAreaBackground(
            hsb,
            "hue",
            "saturation",
        );
        expect(backgroundImage).toMatch(
            /^linear-gradient\(to top, hsl\(210, 0%, 40%\), hsla\(210, 0%, 40%, 0\)\), linear-gradient\(to right, hsl\(0, 100%, 20%\), /,
        );
    });

    it("refuses alpha, a channel twice, or another space's channel", () => {
        expect(() => colorAreaBackground(hsl, "hue", "hue")).toThrow(
            RangeError,
        );
        expect(() => colorAreaBackground(hsl, "alpha", "hue")).toThrow(
            RangeError,
        );
        expect(() => colorAreaBackground(hsl, "brightness", "hue")).toThrow(
            RangeError,
        );
    });
});

describe("colorWheelGradient", () => {
    it("is every hue from the top, clockwise", () => {
        expect(colorWheelGradient()).toBe(
            "conic-gradient(hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))",
        );
    });
});
