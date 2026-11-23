import { type Color, clampColorChannel } from "./color-value.ts";
import { roundTo } from "./convert-color.ts";

const HEX = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FUNCTION = /^(rgba?|hsla?|hsba?)\(\s*([^()]*?)\s*\)$/i;
const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

function parseHex(digits: string): Color {
    const full =
        digits.length <= 4
            ? [...digits].map((digit) => digit + digit).join("")
            : digits;
    const byte = (index: number) =>
        Number.parseInt(full.slice(index * 2, index * 2 + 2), 16);
    return {
        space: "rgb",
        red: byte(0),
        green: byte(1),
        blue: byte(2),
        alpha: full.length === 8 ? roundTo(byte(3) / 255, 4) : 1,
    };
}

/** A number, with the suffix it may carry (`%`, `deg`), or `null`. */
function numberOf(text: string, suffix: "%" | "deg" | ""): number | null {
    let body = text;
    if (suffix !== "" && body.toLowerCase().endsWith(suffix)) {
        body = body.slice(0, -suffix.length);
    }
    return NUMBER.test(body) ? Number(body) : null;
}

/** An alpha: a number from 0 to 1, or a percent. */
function alphaOf(text: string | undefined): number | null {
    if (text === undefined) {
        return 1;
    }
    const value = text.endsWith("%")
        ? (numberOf(text, "%") ?? Number.NaN) / 100
        : numberOf(text, "");
    return value === null || Number.isNaN(value)
        ? null
        : roundTo(clampColorChannel("alpha", value), 4);
}

/** The arguments of `rgb(…)`, `hsl(…)` or `hsb(…)`: commas, or spaces with a `/` before alpha. */
function argumentsOf(body: string): string[] | null {
    if (body.includes(",")) {
        const parts = body.split(",").map((part) => part.trim());
        return parts.length === 3 || parts.length === 4 ? parts : null;
    }
    const [channels = "", alpha, ...rest] = body.split("/");
    if (rest.length > 0) {
        return null;
    }
    const parts = channels.trim().split(/\s+/);
    if (parts.length !== 3) {
        return null;
    }
    return alpha === undefined ? parts : [...parts, alpha.trim()];
}

/** A hue in degrees, turned into `[0, 360)`. */
function hueOf(text: string): number | null {
    const value = numberOf(text, "deg");
    return value === null ? null : roundTo(((value % 360) + 360) % 360, 2);
}

function parseFunction(name: string, body: string): Color | null {
    const parts = argumentsOf(body);
    if (parts === null) {
        return null;
    }
    const [first = "", second = "", third = "", fourth] = parts;
    const alpha = alphaOf(fourth);
    if (alpha === null) {
        return null;
    }
    const space = name.toLowerCase().replace(/a$/, "");
    if (space === "rgb") {
        const channels = [first, second, third].map((part) => {
            const value = numberOf(part, "");
            return value === null
                ? null
                : Math.round(clampColorChannel("red", value));
        });
        const [red, green, blue] = channels;
        if (red == null || green == null || blue == null) {
            return null;
        }
        return { space: "rgb", red, green, blue, alpha };
    }
    const hue = hueOf(first);
    const saturation = numberOf(second, "%");
    const last = numberOf(third, "%");
    if (hue === null || saturation === null || last === null) {
        return null;
    }
    const percent = (value: number) =>
        roundTo(clampColorChannel("saturation", value), 2);
    return space === "hsl"
        ? {
              space: "hsl",
              hue,
              saturation: percent(saturation),
              lightness: percent(last),
              alpha,
          }
        : {
              space: "hsb",
              hue,
              saturation: percent(saturation),
              brightness: percent(last),
              alpha,
          };
}

/**
 * A color from its text (spec/color.md, "Parsing"): hex (`#rgb`, `#rgba`, `#rrggbb`,
 * `#rrggbbaa`, the `#` optional), `rgb()` / `rgba()`, `hsl()` / `hsla()` and `hsb()` / `hsba()`
 * with commas or spaces (`/` before the alpha); `null` when it is none of them. A color given is
 * returned as it is, so a component can take a `Color` or a string.
 */
export function parseColor(value: string | Color): Color | null {
    if (typeof value !== "string") {
        return value;
    }
    const text = value.trim();
    const hex = HEX.exec(text);
    if (hex !== null) {
        return parseHex(hex[1] as string);
    }
    const call = FUNCTION.exec(text);
    if (call === null) {
        return null;
    }
    return parseFunction(call[1] as string, call[2] as string);
}
