import type {
    Color,
    ColorSpace,
    HsbColor,
    HslColor,
    RgbColor,
} from "./color-value.ts";

/**
 * The precision of a converted channel (spec/color.md, "Precision"): red, green and blue are
 * whole numbers (8 bits, what a hex string holds), hue, saturation, lightness and brightness keep
 * 2 decimals, alpha 4 (a hex string's 1/255 steps survive the round trip).
 */
export function roundTo(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    // `+ 0` turns -0 into 0
    return Math.round(value * factor) / factor + 0;
}

/** A channel from 0 to 1 as a byte; the float noise of `0.5 - 0.4` (25.4999…) cut first. */
function byte(value: number): number {
    return Math.round(Number((value * 255).toFixed(6)));
}

function rgbOf(
    red: number,
    green: number,
    blue: number,
    alpha: number,
): RgbColor {
    return {
        space: "rgb",
        red: byte(red),
        green: byte(green),
        blue: byte(blue),
        alpha,
    };
}

function hslToRgb(color: HslColor): RgbColor {
    const s = color.saturation / 100;
    const l = color.lightness / 100;
    const amount = s * Math.min(l, 1 - l);
    const at = (n: number) => {
        const k = (n + color.hue / 30) % 12;
        return l - amount * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return rgbOf(at(0), at(8), at(4), color.alpha);
}

function hsbToRgb(color: HsbColor): RgbColor {
    const s = color.saturation / 100;
    const v = color.brightness / 100;
    const at = (n: number) => {
        const k = (n + color.hue / 60) % 6;
        return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    };
    return rgbOf(at(5), at(3), at(1), color.alpha);
}

/** The hue (degrees), the largest and the smallest of an rgb color's channels (0 to 1). */
function hueOf(color: RgbColor): { hue: number; max: number; min: number } {
    const r = color.red / 255;
    const g = color.green / 255;
    const b = color.blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let hue = 0;
    if (delta !== 0) {
        if (max === r) {
            hue = ((g - b) / delta) % 6;
        } else if (max === g) {
            hue = (b - r) / delta + 2;
        } else {
            hue = (r - g) / delta + 4;
        }
        hue *= 60;
        if (hue < 0) {
            hue += 360;
        }
    }
    return { hue: roundTo(hue, 2) % 360, max, min };
}

function rgbToHsl(color: RgbColor): HslColor {
    const { hue, max, min } = hueOf(color);
    const l = (max + min) / 2;
    const delta = max - min;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    return {
        space: "hsl",
        hue,
        saturation: roundTo(s * 100, 2),
        lightness: roundTo(l * 100, 2),
        alpha: color.alpha,
    };
}

function rgbToHsb(color: RgbColor): HsbColor {
    const { hue, max, min } = hueOf(color);
    const s = max === 0 ? 0 : (max - min) / max;
    return {
        space: "hsb",
        hue,
        saturation: roundTo(s * 100, 2),
        brightness: roundTo(max * 100, 2),
        alpha: color.alpha,
    };
}

function hslToHsb(color: HslColor): HsbColor {
    const s = color.saturation / 100;
    const l = color.lightness / 100;
    const v = l + s * Math.min(l, 1 - l);
    return {
        space: "hsb",
        hue: color.hue,
        saturation: roundTo(v === 0 ? 0 : 2 * (1 - l / v) * 100, 2),
        brightness: roundTo(v * 100, 2),
        alpha: color.alpha,
    };
}

function hsbToHsl(color: HsbColor): HslColor {
    const s = color.saturation / 100;
    const v = color.brightness / 100;
    const l = v * (1 - s / 2);
    const lowest = Math.min(l, 1 - l);
    return {
        space: "hsl",
        hue: color.hue,
        saturation: roundTo(lowest === 0 ? 0 : ((v - l) / lowest) * 100, 2),
        lightness: roundTo(l * 100, 2),
        alpha: color.alpha,
    };
}

/**
 * `color` in `space` (spec/color.md, "Conversion"): the same object when it already is in it;
 * hsl and hsb convert directly (the hue kept), the others through rgb. Each converted channel is
 * rounded to its precision.
 */
export function convertColor(color: Color, space: ColorSpace): Color {
    if (color.space === space) {
        return color;
    }
    if (color.space === "hsl" && space === "hsb") {
        return hslToHsb(color);
    }
    if (color.space === "hsb" && space === "hsl") {
        return hsbToHsl(color);
    }
    const rgb =
        color.space === "rgb"
            ? color
            : color.space === "hsl"
              ? hslToRgb(color)
              : hsbToRgb(color);
    if (space === "rgb") {
        return rgb;
    }
    return space === "hsl" ? rgbToHsl(rgb) : rgbToHsb(rgb);
}
