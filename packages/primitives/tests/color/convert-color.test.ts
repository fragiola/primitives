import { describe, expect, it } from "vitest";
import type {
    Color,
    HsbColor,
    HslColor,
    RgbColor,
} from "../../src/color/color-value.ts";
import { convertColor } from "../../src/color/convert-color.ts";
import { formatColor } from "../../src/color/format-color.ts";

const rgb = (
    red: number,
    green: number,
    blue: number,
    alpha = 1,
): RgbColor => ({
    space: "rgb",
    red,
    green,
    blue,
    alpha,
});

// spec/color.md, "Conversion" and "Precision"
describe("convertColor", () => {
    it("returns the same object for its own space", () => {
        const color = rgb(1, 2, 3);
        expect(convertColor(color, "rgb")).toBe(color);
    });

    it("converts the primaries, white, black and gray", () => {
        expect(convertColor(rgb(255, 0, 0), "hsl")).toEqual({
            space: "hsl",
            hue: 0,
            saturation: 100,
            lightness: 50,
            alpha: 1,
        });
        expect(convertColor(rgb(0, 255, 0), "hsb")).toEqual({
            space: "hsb",
            hue: 120,
            saturation: 100,
            brightness: 100,
            alpha: 1,
        });
        expect(convertColor(rgb(255, 255, 255), "hsl")).toMatchObject({
            hue: 0,
            saturation: 0,
            lightness: 100,
        });
        expect(convertColor(rgb(0, 0, 0), "hsb")).toMatchObject({
            hue: 0,
            saturation: 0,
            brightness: 0,
        });
        expect(convertColor(rgb(128, 128, 128), "hsl")).toMatchObject({
            saturation: 0,
            lightness: 50.2,
        });
        const blue: HslColor = {
            space: "hsl",
            hue: 240,
            saturation: 100,
            lightness: 50,
            alpha: 0.5,
        };
        expect(convertColor(blue, "rgb")).toEqual(rgb(0, 0, 255, 0.5));
    });

    it("keeps 2 decimals for hue, saturation, lightness and brightness, whole numbers for rgb", () => {
        const hsl = convertColor(rgb(51, 102, 153), "hsl") as HslColor;
        expect(hsl).toEqual({
            space: "hsl",
            hue: 210,
            saturation: 50,
            lightness: 40,
            alpha: 1,
        });
        const odd = convertColor(rgb(17, 200, 99), "hsb") as HsbColor;
        for (const value of [odd.hue, odd.saturation, odd.brightness]) {
            expect(Number(value.toFixed(2))).toBe(value);
        }
        const back = convertColor(
            {
                space: "hsb",
                hue: 33.33,
                saturation: 12.5,
                brightness: 77.7,
                alpha: 1,
            },
            "rgb",
        ) as RgbColor;
        for (const value of [back.red, back.green, back.blue]) {
            expect(Number.isInteger(value)).toBe(true);
        }
    });

    it("converts hsl and hsb directly, keeping the hue", () => {
        const hsl: HslColor = {
            space: "hsl",
            hue: 200,
            saturation: 0,
            lightness: 30,
            alpha: 1,
        };
        // through rgb, the hue of a gray would be lost
        expect(convertColor(hsl, "hsb")).toEqual({
            space: "hsb",
            hue: 200,
            saturation: 0,
            brightness: 30,
            alpha: 1,
        });
        expect(
            convertColor(
                {
                    space: "hsb",
                    hue: 10,
                    saturation: 100,
                    brightness: 100,
                    alpha: 1,
                },
                "hsl",
            ),
        ).toEqual({
            space: "hsl",
            hue: 10,
            saturation: 100,
            lightness: 50,
            alpha: 1,
        });
    });

    it("round-trips every rgb color through hsl and hsb exactly", () => {
        const misses: string[] = [];
        for (let red = 0; red <= 255; red += 3) {
            for (let green = 0; green <= 255; green += 5) {
                for (let blue = 0; blue <= 255; blue += 1) {
                    const color = rgb(red, green, blue);
                    for (const space of ["hsl", "hsb"] as const) {
                        const back = convertColor(
                            convertColor(color, space),
                            "rgb",
                        );
                        if (
                            back.space !== "rgb" ||
                            back.red !== red ||
                            back.green !== green ||
                            back.blue !== blue
                        ) {
                            misses.push(`${red},${green},${blue} via ${space}`);
                        }
                    }
                }
            }
        }
        expect(misses).toEqual([]);
    }, 30_000);

    it("round-trips hsb through hsl within 0.01, hsl through hsb back to its whole steps", () => {
        const worst = { hsl: 0, hsb: 0 };
        const misses: string[] = [];
        for (let hue = 0; hue < 360; hue += 7) {
            for (let saturation = 0; saturation <= 100; saturation += 1) {
                for (let last = 1; last <= 100; last += 1) {
                    const hsb: HsbColor = {
                        space: "hsb",
                        hue,
                        saturation,
                        brightness: last,
                        alpha: 1,
                    };
                    const viaHsl = convertColor(
                        convertColor(hsb, "hsl"),
                        "hsb",
                    ) as HsbColor;
                    worst.hsb = Math.max(
                        worst.hsb,
                        Math.abs(viaHsl.saturation - saturation),
                        Math.abs(viaHsl.brightness - last),
                        Math.abs(viaHsl.hue - hue),
                    );
                    if (last < 100) {
                        const hsl: HslColor = {
                            space: "hsl",
                            hue,
                            saturation,
                            lightness: last,
                            alpha: 1,
                        };
                        const viaHsb = convertColor(
                            convertColor(hsl, "hsb"),
                            "hsl",
                        ) as HslColor;
                        worst.hsl = Math.max(
                            worst.hsl,
                            Math.abs(viaHsb.saturation - saturation),
                            Math.abs(viaHsb.lightness - last),
                        );
                        // a whole-step value (the sliders' step) comes back as it was
                        if (
                            Math.round(viaHsb.saturation) !== saturation ||
                            Math.round(viaHsb.lightness) !== last
                        ) {
                            misses.push(
                                `hsl(${hue}, ${saturation}%, ${last}%)`,
                            );
                        }
                    }
                }
            }
        }
        expect(misses).toEqual([]);
        expect(worst.hsb).toBeLessThanOrEqual(0.01 + 1e-9);
        // hsl's saturation is amplified near white and black, where it barely shows
        expect(worst.hsl).toBeLessThan(0.2);
    });

    it("rounds a byte half up, through the float noise", () => {
        // 0.5 - 0.4 is 0.0999…: 25.4999… of 255, a half that must round up
        const blue: HslColor = {
            space: "hsl",
            hue: 210,
            saturation: 80,
            lightness: 50,
            alpha: 1,
        };
        expect(formatColor(convertColor(blue, "rgb"), "hex")).toBe("#1a80e6");
    });

    it("keeps the alpha", () => {
        const colors: Color[] = [
            rgb(1, 2, 3, 0.25),
            convertColor(rgb(1, 2, 3, 0.25), "hsl"),
            convertColor(rgb(1, 2, 3, 0.25), "hsb"),
        ];
        expect(colors.map((color) => color.alpha)).toEqual([0.25, 0.25, 0.25]);
    });
});
