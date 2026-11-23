/** The color spaces of the color model (spec/color.md, "The value"). */
export type ColorSpace = "rgb" | "hsl" | "hsb";

/** A color's channels: three per space, and the alpha every space has. */
export type ColorChannel =
    | "red"
    | "green"
    | "blue"
    | "hue"
    | "saturation"
    | "lightness"
    | "brightness"
    | "alpha";

/** sRGB: `red`, `green`, `blue` from 0 to 255 (whole numbers), `alpha` from 0 to 1. */
export interface RgbColor {
    readonly space: "rgb";
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly alpha: number;
}

/** HSL: `hue` from 0 to 360 (degrees), `saturation` and `lightness` from 0 to 100 (percent). */
export interface HslColor {
    readonly space: "hsl";
    readonly hue: number;
    readonly saturation: number;
    readonly lightness: number;
    readonly alpha: number;
}

/** HSB (HSV): `hue` from 0 to 360, `saturation` and `brightness` from 0 to 100. */
export interface HsbColor {
    readonly space: "hsb";
    readonly hue: number;
    readonly saturation: number;
    readonly brightness: number;
    readonly alpha: number;
}

/**
 * An immutable color value (spec/color.md): a plain object in one space, which every function
 * of the model returns anew and never changes.
 */
export type Color = RgbColor | HslColor | HsbColor;

/** A channel's bounds and steps (spec/color.md, "Channels"). */
export interface ColorChannelRange {
    min: number;
    max: number;
    /** The arrows' step. */
    step: number;
    /** Page Up / Page Down and Shift with an arrow. */
    largeStep: number;
}

const RANGES: Record<ColorChannel, ColorChannelRange> = {
    red: { min: 0, max: 255, step: 1, largeStep: 17 },
    green: { min: 0, max: 255, step: 1, largeStep: 17 },
    blue: { min: 0, max: 255, step: 1, largeStep: 17 },
    hue: { min: 0, max: 360, step: 1, largeStep: 15 },
    saturation: { min: 0, max: 100, step: 1, largeStep: 10 },
    lightness: { min: 0, max: 100, step: 1, largeStep: 10 },
    brightness: { min: 0, max: 100, step: 1, largeStep: 10 },
    alpha: { min: 0, max: 1, step: 0.01, largeStep: 0.1 },
};

const CHANNELS: Record<
    ColorSpace,
    readonly [ColorChannel, ColorChannel, ColorChannel]
> = {
    rgb: ["red", "green", "blue"],
    hsl: ["hue", "saturation", "lightness"],
    hsb: ["hue", "saturation", "brightness"],
};

/** A channel's bounds and steps. */
export function colorChannelRange(channel: ColorChannel): ColorChannelRange {
    return { ...RANGES[channel] };
}

/** The three color channels of a space, in order (alpha, which every space has, aside). */
export function colorChannels(
    space: ColorSpace,
): readonly [ColorChannel, ColorChannel, ColorChannel] {
    return CHANNELS[space];
}

/** Whether `channel` is one of `space`'s (alpha is every space's). */
export function hasColorChannel(
    space: ColorSpace,
    channel: ColorChannel,
): boolean {
    return channel === "alpha" || CHANNELS[space].includes(channel);
}

/**
 * The space a control edits `channel` in (spec/color.md, "Channels"): `preferred` (the control's
 * `colorSpace`) when given, else the value's own space when it has the channel, else the
 * channel's own space (`red`, `green`, `blue`: rgb; `lightness`: hsl; `hue`, `saturation`,
 * `brightness`: hsb).
 */
export function colorSpaceFor(
    channel: ColorChannel,
    color: Color,
    preferred?: ColorSpace,
): ColorSpace {
    if (preferred !== undefined) {
        return preferred;
    }
    if (hasColorChannel(color.space, channel)) {
        return color.space;
    }
    if (channel === "red" || channel === "green" || channel === "blue") {
        return "rgb";
    }
    return channel === "lightness" ? "hsl" : "hsb";
}

/** A channel's value. `channel` must be one of the color's space (else a `RangeError`). */
export function getColorChannel(color: Color, channel: ColorChannel): number {
    if (!hasColorChannel(color.space, channel)) {
        throw new RangeError(`a ${color.space} color has no ${channel}`);
    }
    return (color as unknown as Record<ColorChannel, number>)[channel];
}

/** `value` clamped to the channel's bounds. */
export function clampColorChannel(
    channel: ColorChannel,
    value: number,
): number {
    const { min, max } = RANGES[channel];
    return Math.min(Math.max(value, min), max);
}

/**
 * A new color with `channel` set to `value`, clamped to its bounds. `channel` must be one of the
 * color's space (else a `RangeError`): convert the color first (`convertColor`).
 */
export function setColorChannel(
    color: Color,
    channel: ColorChannel,
    value: number,
): Color {
    if (!hasColorChannel(color.space, channel)) {
        throw new RangeError(`a ${color.space} color has no ${channel}`);
    }
    return { ...color, [channel]: clampColorChannel(channel, value) } as Color;
}

/** Whether two colors are the same value: the same space and the same channels. */
export function isSameColor(
    a: Color | null | undefined,
    b: Color | null | undefined,
): boolean {
    if (a === b) {
        return true;
    }
    if (a === null || a === undefined || b === null || b === undefined) {
        return false;
    }
    if (a.space !== b.space || a.alpha !== b.alpha) {
        return false;
    }
    return CHANNELS[a.space].every(
        (channel) =>
            getColorChannel(a, channel) === getColorChannel(b, channel),
    );
}

/** The space and the two channels of a ColorArea (spec/color-area.md, "API"). */
export interface ColorAreaChannels {
    space: ColorSpace;
    xChannel: ColorChannel;
    yChannel: ColorChannel;
}

const AREA_DEFAULTS: Record<ColorSpace, readonly [ColorChannel, ColorChannel]> =
    {
        rgb: ["red", "green"],
        hsl: ["saturation", "lightness"],
        hsb: ["saturation", "brightness"],
    };

/**
 * A ColorArea's space and channels: `colorSpace`, else the value's own space when it has both
 * given channels, else the space of the more specific channel (lightness: hsl; brightness: hsb;
 * red, green, blue: rgb; else hsb); the channels not given are the space's defaults (rgb: red and
 * green; hsl: saturation and lightness; hsb: saturation and brightness).
 */
export function colorAreaChannels(
    color: Color,
    options: {
        xChannel?: ColorChannel | undefined;
        yChannel?: ColorChannel | undefined;
        colorSpace?: ColorSpace | undefined;
    } = {},
): ColorAreaChannels {
    const given = [options.xChannel, options.yChannel].filter(
        (channel): channel is ColorChannel => channel !== undefined,
    );
    let space = options.colorSpace;
    if (space === undefined) {
        if (given.every((channel) => CHANNELS[color.space].includes(channel))) {
            space = color.space;
        } else if (given.includes("lightness")) {
            space = "hsl";
        } else if (given.includes("brightness")) {
            space = "hsb";
        } else if (given.some((channel) => CHANNELS.rgb.includes(channel))) {
            space = "rgb";
        } else {
            space = "hsb";
        }
    }
    const [x, y] = AREA_DEFAULTS[space];
    const xChannel = options.xChannel ?? (options.yChannel === x ? y : x);
    const yChannel = options.yChannel ?? (xChannel === y ? x : y);
    return { space, xChannel, yChannel };
}
