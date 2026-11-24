import { describe, expect, it } from "vitest";
import {
    type Color,
    colorAreaChannels,
    colorChannelRange,
    colorChannels,
    colorSpaceFor,
    getColorChannel,
    hasColorChannel,
    isSameColor,
    setColorChannel,
} from "../../src/color/color-value.ts";
import {
    colorChannelFormat,
    formatColorChannel,
} from "../../src/color/format-color.ts";

const hsl: Color = {
    space: "hsl",
    hue: 120,
    saturation: 50,
    lightness: 25,
    alpha: 0.5,
};

// spec/color.md, "Channels" and "Channel text"
describe("the channels", () => {
    it("has three per space and alpha in every space", () => {
        expect(colorChannels("rgb")).toEqual(["red", "green", "blue"]);
        expect(colorChannels("hsl")).toEqual([
            "hue",
            "saturation",
            "lightness",
        ]);
        expect(colorChannels("hsb")).toEqual([
            "hue",
            "saturation",
            "brightness",
        ]);
        expect(hasColorChannel("rgb", "alpha")).toBe(true);
        expect(hasColorChannel("rgb", "hue")).toBe(false);
    });

    it("gives each channel its range and steps", () => {
        expect(colorChannelRange("red")).toEqual({
            min: 0,
            max: 255,
            step: 1,
            largeStep: 17,
        });
        expect(colorChannelRange("hue")).toEqual({
            min: 0,
            max: 360,
            step: 1,
            largeStep: 15,
        });
        expect(colorChannelRange("lightness")).toEqual({
            min: 0,
            max: 100,
            step: 1,
            largeStep: 10,
        });
        expect(colorChannelRange("alpha")).toEqual({
            min: 0,
            max: 1,
            step: 0.01,
            largeStep: 0.1,
        });
    });

    it("reads and sets a channel of the color's space, clamped, as a new color", () => {
        expect(getColorChannel(hsl, "lightness")).toBe(25);
        const next = setColorChannel(hsl, "saturation", 140);
        expect(next).toEqual({ ...hsl, saturation: 100 });
        expect(next).not.toBe(hsl);
        expect(hsl.saturation).toBe(50);
        expect(() => getColorChannel(hsl, "red")).toThrow(RangeError);
        expect(() => setColorChannel(hsl, "brightness", 1)).toThrow(RangeError);
    });

    it("picks the space a control edits a channel in", () => {
        const rgb: Color = {
            space: "rgb",
            red: 0,
            green: 0,
            blue: 0,
            alpha: 1,
        };
        expect(colorSpaceFor("hue", hsl)).toBe("hsl");
        expect(colorSpaceFor("hue", rgb)).toBe("hsb");
        expect(colorSpaceFor("lightness", rgb)).toBe("hsl");
        expect(colorSpaceFor("red", hsl)).toBe("rgb");
        expect(colorSpaceFor("alpha", rgb)).toBe("rgb");
        expect(colorSpaceFor("hue", rgb, "hsl")).toBe("hsl");
    });

    it("compares two values", () => {
        expect(isSameColor(hsl, { ...hsl })).toBe(true);
        expect(isSameColor(hsl, { ...hsl, alpha: 1 })).toBe(false);
        expect(isSameColor(hsl, null)).toBe(false);
        expect(isSameColor(null, null)).toBe(true);
    });

    it("writes a channel's value through Intl", () => {
        expect(formatColorChannel(hsl, "hue", "en-US")).toBe("120°");
        expect(formatColorChannel(hsl, "saturation", "en-US")).toBe("50%");
        expect(formatColorChannel(hsl, "lightness", "de-DE")).toBe("25\u00a0%");
        expect(formatColorChannel(hsl, "alpha", "en-US")).toBe("50%");
        expect(
            formatColorChannel(
                { space: "rgb", red: 128, green: 0, blue: 0, alpha: 1 },
                "red",
                "en-US",
            ),
        ).toBe("128");
        expect(formatColorChannel(hsl, "hue", "en-US", 33.4)).toBe("33°");
        expect(colorChannelFormat("saturation").scale).toBe(0.01);
    });
});

describe("colorAreaChannels", () => {
    const rgb: Color = { space: "rgb", red: 0, green: 0, blue: 0, alpha: 1 };

    it("defaults to the value's space and its two channels", () => {
        expect(colorAreaChannels(hsl)).toEqual({
            space: "hsl",
            xChannel: "saturation",
            yChannel: "lightness",
        });
        expect(colorAreaChannels(rgb)).toEqual({
            space: "rgb",
            xChannel: "red",
            yChannel: "green",
        });
    });

    it("finds the space of the channels given", () => {
        expect(
            colorAreaChannels(rgb, {
                xChannel: "saturation",
                yChannel: "brightness",
            }),
        ).toEqual({
            space: "hsb",
            xChannel: "saturation",
            yChannel: "brightness",
        });
        expect(
            colorAreaChannels(rgb, { xChannel: "hue", yChannel: "lightness" })
                .space,
        ).toBe("hsl");
        expect(
            colorAreaChannels(hsl, { xChannel: "blue", yChannel: "red" }).space,
        ).toBe("rgb");
        expect(colorAreaChannels(hsl, { yChannel: "saturation" })).toEqual({
            space: "hsl",
            xChannel: "lightness",
            yChannel: "saturation",
        });
        expect(colorAreaChannels(hsl, { colorSpace: "hsb" })).toEqual({
            space: "hsb",
            xChannel: "saturation",
            yChannel: "brightness",
        });
    });
});
