import {
    type Color,
    type ColorChannel,
    getColorChannel,
} from "./color-value.ts";
import { convertColor, roundTo } from "./convert-color.ts";

/**
 * How `formatColor` writes a color (spec/color.md, "Formatting"). `hex` writes `#rrggbb`, and
 * `#rrggbbaa` when the alpha is below 1 (nothing is lost); `hexa` always the eight digits; `css`
 * the color's own function (`rgb()`, `hsl()`; hsb, which CSS has not, as `hsl()`), with its alpha
 * when below 1.
 */
export type ColorFormat =
    | "hex"
    | "hexa"
    | "rgb"
    | "rgba"
    | "hsl"
    | "hsla"
    | "hsb"
    | "hsba"
    | "css";

function hexByte(value: number): string {
    return Math.round(value).toString(16).padStart(2, "0");
}

function number(value: number): string {
    return String(roundTo(value, 2));
}

/** `color` as text, lower-case hex or a CSS function with commas (`rgb(255, 0, 0)`). */
export function formatColor(color: Color, format: ColorFormat = "css"): string {
    if (format === "css") {
        if (color.space === "rgb") {
            return formatColor(color, color.alpha < 1 ? "rgba" : "rgb");
        }
        return formatColor(color, color.alpha < 1 ? "hsla" : "hsl");
    }
    if (format === "hex" || format === "hexa") {
        const rgb = convertColor(color, "rgb") as Extract<
            Color,
            { space: "rgb" }
        >;
        const digits = `#${hexByte(rgb.red)}${hexByte(rgb.green)}${hexByte(rgb.blue)}`;
        return format === "hexa" || rgb.alpha < 1
            ? `${digits}${hexByte(rgb.alpha * 255)}`
            : digits;
    }
    const space = format.replace(/a$/, "") as "rgb" | "hsl" | "hsb";
    const converted = convertColor(color, space);
    const alpha = format.endsWith("a")
        ? `, ${String(roundTo(converted.alpha, 4))}`
        : "";
    if (converted.space === "rgb") {
        return `${format}(${converted.red}, ${converted.green}, ${converted.blue}${alpha})`;
    }
    const last =
        converted.space === "hsl" ? converted.lightness : converted.brightness;
    return `${format}(${number(converted.hue)}, ${number(converted.saturation)}%, ${number(last)}%${alpha})`;
}

/**
 * The `Intl.NumberFormat` options a channel's value is written with (spec/color.md, "Channel
 * text"), and the scale its value is multiplied by first: hue in degrees (`unit: "degree"`),
 * saturation, lightness, brightness and alpha as percents, red, green and blue as whole numbers.
 * The digits follow the channel's step.
 */
export function colorChannelFormat(channel: ColorChannel): {
    format: Intl.NumberFormatOptions;
    scale: number;
} {
    switch (channel) {
        case "hue":
            return {
                format: {
                    style: "unit",
                    unit: "degree",
                    unitDisplay: "narrow",
                    maximumFractionDigits: 0,
                },
                scale: 1,
            };
        case "saturation":
        case "lightness":
        case "brightness":
            return {
                format: { style: "percent", maximumFractionDigits: 0 },
                scale: 0.01,
            };
        case "alpha":
            return {
                format: { style: "percent", maximumFractionDigits: 0 },
                scale: 1,
            };
        default:
            return { format: { maximumFractionDigits: 0 }, scale: 1 };
    }
}

/**
 * A channel's value as text for `locale` (BCP 47; default: the runtime's), through `Intl`: `"120°"`,
 * `"50%"` (`"50 %"` in de-DE), `"128"`. A value given wins over the color's.
 */
export function formatColorChannel(
    color: Color,
    channel: ColorChannel,
    locale?: string,
    value: number = getColorChannel(color, channel),
): string {
    const { format, scale } = colorChannelFormat(channel);
    return new Intl.NumberFormat(locale, format).format(value * scale);
}
