import { describe, expect, it } from "vitest";
import type { Color, RgbColor } from "../../src/color/color-value.ts";
import { convertColor } from "../../src/color/convert-color.ts";
import { formatColor } from "../../src/color/format-color.ts";
import { parseColor } from "../../src/color/parse-color.ts";

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

// spec/color.md, "Parsing" and "Formatting"
describe("parseColor", () => {
    it("reads hex in its four lengths, with or without #, in any case", () => {
        expect(parseColor("#f00")).toEqual(rgb(255, 0, 0));
        expect(parseColor("F008")).toEqual(rgb(255, 0, 0, 0.5333));
        expect(parseColor("#336699")).toEqual(rgb(51, 102, 153));
        expect(parseColor(" #33669980 ")).toEqual(rgb(51, 102, 153, 0.502));
    });

    it("reads rgb(), hsl() and hsb() with commas or spaces, and their alpha", () => {
        expect(parseColor("rgb(51, 102, 153)")).toEqual(rgb(51, 102, 153));
        expect(parseColor("rgba(51,102,153,0.5)")).toEqual(
            rgb(51, 102, 153, 0.5),
        );
        expect(parseColor("rgb(51 102 153 / 50%)")).toEqual(
            rgb(51, 102, 153, 0.5),
        );
        expect(parseColor("hsl(210, 50%, 40%)")).toEqual({
            space: "hsl",
            hue: 210,
            saturation: 50,
            lightness: 40,
            alpha: 1,
        });
        expect(parseColor("HSLA(210deg 50% 40% / 0.25)")).toMatchObject({
            space: "hsl",
            hue: 210,
            alpha: 0.25,
        });
        expect(parseColor("hsb(90, 100%, 50%)")).toEqual({
            space: "hsb",
            hue: 90,
            saturation: 100,
            brightness: 50,
            alpha: 1,
        });
        expect(parseColor("hsba(90, 100, 50, 1)")).toMatchObject({
            space: "hsb",
        });
    });

    it("clamps channels and turns a hue into [0, 360)", () => {
        expect(parseColor("rgb(300, -5, 12.6)")).toEqual(rgb(255, 0, 13));
        expect(parseColor("hsl(-30, 120%, 50%)")).toMatchObject({
            hue: 330,
            saturation: 100,
        });
        expect(parseColor("hsl(360, 0%, 0%)")).toMatchObject({ hue: 0 });
    });

    it("refuses anything else", () => {
        for (const text of [
            "",
            "red",
            "#12",
            "#12345",
            "#ggg",
            "rgb(1, 2)",
            "rgb(1, 2, 3, 4, 5)",
            "rgb(a, b, c)",
            "hsl(1 2 3 / 4 / 5)",
            "cmyk(1, 2, 3, 4)",
            "rgb(1, 2, 3",
        ]) {
            expect(parseColor(text), text).toBeNull();
        }
    });

    it("returns a color given as it is", () => {
        const color = rgb(1, 2, 3);
        expect(parseColor(color)).toBe(color);
    });
});

describe("formatColor", () => {
    it("writes hex, keeping the alpha only below 1, or always with hexa", () => {
        expect(formatColor(rgb(51, 102, 153), "hex")).toBe("#336699");
        expect(formatColor(rgb(51, 102, 153, 0.5), "hex")).toBe("#33669980");
        expect(formatColor(rgb(51, 102, 153), "hexa")).toBe("#336699ff");
        expect(
            formatColor(
                {
                    space: "hsl",
                    hue: 0,
                    saturation: 100,
                    lightness: 50,
                    alpha: 1,
                },
                "hex",
            ),
        ).toBe("#ff0000");
    });

    it("writes the CSS functions with commas, converting when asked", () => {
        const color = rgb(51, 102, 153, 0.5);
        expect(formatColor(color, "rgb")).toBe("rgb(51, 102, 153)");
        expect(formatColor(color, "rgba")).toBe("rgba(51, 102, 153, 0.5)");
        expect(formatColor(color, "hsl")).toBe("hsl(210, 50%, 40%)");
        expect(formatColor(color, "hsla")).toBe("hsla(210, 50%, 40%, 0.5)");
        expect(formatColor(color, "hsb")).toBe("hsb(210, 66.67%, 60%)");
        expect(formatColor(color, "hsba")).toBe("hsba(210, 66.67%, 60%, 0.5)");
    });

    it("writes css as the color's own function, hsb as hsl", () => {
        expect(formatColor(rgb(1, 2, 3))).toBe("rgb(1, 2, 3)");
        expect(formatColor(rgb(1, 2, 3, 0.5))).toBe("rgba(1, 2, 3, 0.5)");
        expect(
            formatColor({
                space: "hsb",
                hue: 120,
                saturation: 100,
                brightness: 100,
                alpha: 1,
            }),
        ).toBe("hsl(120, 100%, 50%)");
    });

    it("round-trips through its own text", () => {
        const colors: Color[] = [];
        for (let byte = 0; byte <= 255; byte += 1) {
            colors.push(rgb(byte, 255 - byte, (byte * 7) % 256, byte / 255));
        }
        for (const color of colors) {
            const rounded = parseColor(formatColor(color, "hexa"));
            expect(formatColor(rounded as Color, "hexa")).toBe(
                formatColor(color, "hexa"),
            );
            for (const format of ["rgba", "hsla", "hsba"] as const) {
                const back = parseColor(formatColor(rounded as Color, format));
                expect(
                    formatColor(convertColor(back as Color, "rgb"), "hexa"),
                ).toBe(formatColor(color, "hexa"));
            }
        }
    });
});
