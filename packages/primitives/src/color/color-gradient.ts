import {
    type Color,
    type ColorChannel,
    colorChannelRange,
    colorChannels,
    hasColorChannel,
    setColorChannel,
} from "./color-value.ts";
import { formatColor } from "./format-color.ts";

/** A CSS gradient direction: a slider's from its `min` to its `max`. */
export type ColorGradientDirection =
    | "to right"
    | "to left"
    | "to top"
    | "to bottom";

/** The hue's stops: the primaries and secondaries, every 60°, where the hue ramp turns. */
const HUE_STOPS = [0, 60, 120, 180, 240, 300, 360];

function stops(colors: readonly Color[]): string {
    return colors.map((color) => formatColor(color, "css")).join(", ");
}

/** The colors along `channel`, the color's other channels kept, as linear stops. */
function channelStops(color: Color, channel: ColorChannel): Color[] {
    if (channel === "hue") {
        return HUE_STOPS.map((hue) => setColorChannel(color, "hue", hue));
    }
    const { min, max } = colorChannelRange(channel);
    // a lightness ramp turns at 50% (black, the color, white)
    const values = channel === "lightness" ? [min, 50, max] : [min, max];
    return values.map((value) => setColorChannel(color, channel, value));
}

/**
 * The CSS `linear-gradient` of a slider's track (spec/color.md, "Gradients"): `channel` from its
 * `min` to its `max` along `direction`, the color's other channels kept, except the hue track,
 * which shows every hue at full saturation (and, in hsb, full brightness; in hsl, 50% lightness).
 * Every stop is a linear ramp in sRGB, so the gradient is exact. The alpha track keeps the
 * color's other channels, opaque at its end.
 */
export function colorChannelGradient(
    color: Color,
    channel: ColorChannel,
    direction: ColorGradientDirection = "to right",
): string {
    if (!hasColorChannel(color.space, channel)) {
        throw new RangeError(`a ${color.space} color has no ${channel}`);
    }
    let base: Color =
        channel === "alpha" ? color : setColorChannel(color, "alpha", 1);
    if (channel === "hue") {
        base =
            base.space === "hsl"
                ? { ...base, saturation: 100, lightness: 50 }
                : base.space === "hsb"
                  ? { ...base, saturation: 100, brightness: 100 }
                  : base;
    }
    return `linear-gradient(${direction}, ${stops(channelStops(base, channel))})`;
}

/** A ColorArea's background: its layers, and how they blend (`screen` for two rgb channels). */
export interface ColorAreaBackground {
    backgroundImage: string;
    backgroundBlendMode: "normal" | "screen";
}

function gradient(direction: string, colors: readonly string[]): string {
    return `linear-gradient(${direction}, ${colors.join(", ")})`;
}

/**
 * A ColorArea's background (spec/color.md, "Gradients"): two gradient layers that give, at every
 * point, the color with `xChannel` and `yChannel` at that point and its third channel kept, exactly
 * (sRGB compositing): two rgb channels add up through `screen`; a lightness or brightness axis is
 * a black (and white) layer over the other channel's ramp; a saturation axis beside a hue axis
 * fades the hue ramp to gray. `x` runs from the inline start (`rtl`: from the right), `y` from
 * the bottom. The channels are two different color channels of the color's space (no alpha).
 */
export function colorAreaBackground(
    color: Color,
    xChannel: ColorChannel,
    yChannel: ColorChannel,
    rtl = false,
): ColorAreaBackground {
    const space = colorChannels(color.space);
    if (
        xChannel === yChannel ||
        !space.includes(xChannel) ||
        !space.includes(yChannel)
    ) {
        throw new RangeError(
            `${xChannel} and ${yChannel} are not two channels of a ${color.space} color`,
        );
    }
    const opaque = setColorChannel(color, "alpha", 1);
    const xDirection = rtl ? "to left" : "to right";
    if (opaque.space === "rgb") {
        const zero = { ...opaque, [xChannel]: 0, [yChannel]: 0 } as Color;
        const black: Color = {
            space: "rgb",
            red: 0,
            green: 0,
            blue: 0,
            alpha: 1,
        };
        const xMax = setColorChannel(zero, xChannel, 255);
        const yMax = setColorChannel(black, yChannel, 255);
        return {
            backgroundImage: [
                gradient(xDirection, [formatColor(zero), formatColor(xMax)]),
                gradient("to top", [formatColor(black), formatColor(yMax)]),
            ].join(", "),
            backgroundBlendMode: "screen",
        };
    }
    // the axis that darkens (lightness, brightness), else the saturation beside a hue axis
    const shade =
        xChannel === "lightness" || xChannel === "brightness"
            ? "x"
            : yChannel === "lightness" || yChannel === "brightness"
              ? "y"
              : xChannel === "saturation"
                ? "x"
                : "y";
    const shadeChannel = shade === "x" ? xChannel : yChannel;
    const rampChannel = shade === "x" ? yChannel : xChannel;
    const shadeDirection = shade === "x" ? xDirection : "to top";
    const rampDirection = shade === "x" ? "to top" : xDirection;
    let overlay: string;
    let ramp: Color = opaque;
    if (shadeChannel === "brightness") {
        // hsb: a color at brightness b is the color at 100% mixed with black by 1 - b
        ramp = setColorChannel(opaque, "brightness", 100);
        overlay = gradient(shadeDirection, [
            "rgb(0, 0, 0)",
            "rgba(0, 0, 0, 0)",
        ]);
    } else if (shadeChannel === "lightness") {
        // hsl: the color at 50% lightness, mixed with black below 50% and with white above
        ramp = setColorChannel(opaque, "lightness", 50);
        overlay = gradient(shadeDirection, [
            "rgb(0, 0, 0) 0%",
            "rgba(0, 0, 0, 0) 50%",
            "rgba(255, 255, 255, 0) 50%",
            "rgb(255, 255, 255) 100%",
        ]);
    } else {
        // saturation beside hue: the full-saturation hue ramp, faded to the gray of 0% saturation
        ramp = setColorChannel(opaque, "saturation", 100);
        const gray = formatColor(setColorChannel(opaque, "saturation", 0));
        const clear = formatColor(
            setColorChannel(
                setColorChannel(opaque, "saturation", 0),
                "alpha",
                0,
            ),
        );
        overlay = gradient(shadeDirection, [gray, clear]);
    }
    const rampStops =
        rampChannel === "hue"
            ? channelStops(ramp, "hue")
            : [
                  setColorChannel(ramp, rampChannel, 0),
                  setColorChannel(ramp, rampChannel, 100),
              ];
    return {
        backgroundImage: [
            overlay,
            `linear-gradient(${rampDirection}, ${stops(rampStops)})`,
        ].join(", "),
        backgroundBlendMode: "normal",
    };
}

/**
 * A ColorWheel's track (spec/color.md, "Gradients"): every hue at full saturation, from 0° at the
 * top, clockwise (the `conic-gradient`'s own start and direction).
 */
export function colorWheelGradient(): string {
    const hues: Color[] = HUE_STOPS.map((hue) => ({
        space: "hsl",
        hue,
        saturation: 100,
        lightness: 50,
        alpha: 1,
    }));
    return `conic-gradient(${stops(hues)})`;
}
