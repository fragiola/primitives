// The entry of @fragiola/primitives/color: the color model (spec/color.md): an immutable color
// value in rgb, hsl and hsb with alpha, its parsing, formatting and conversions, the channels'
// ranges and `Intl` text, the CSS gradients of a track, an area and a wheel, and the keys and
// geometry of an area and a wheel. Only the color components import it (D8).

export {
    type ColorAreaBackground,
    type ColorGradientDirection,
    colorAreaBackground,
    colorChannelGradient,
    colorWheelGradient,
} from "./color-gradient.ts";
export {
    type ColorAreaKeyOptions,
    colorAreaKeyTarget,
    colorWheelKeyTarget,
    wrapHue,
} from "./color-keys.ts";
export {
    type Color,
    type ColorAreaChannels,
    type ColorChannel,
    type ColorChannelRange,
    type ColorSpace,
    clampColorChannel,
    colorAreaChannels,
    colorChannelRange,
    colorChannels,
    colorSpaceFor,
    getColorChannel,
    type HsbColor,
    type HslColor,
    hasColorChannel,
    isSameColor,
    type RgbColor,
    setColorChannel,
} from "./color-value.ts";
export {
    colorWheelThumbOffset,
    hueAtPoint,
    isOnColorWheel,
} from "./color-wheel-geometry.ts";
export { convertColor } from "./convert-color.ts";
export {
    type ColorFormat,
    colorChannelFormat,
    formatColor,
    formatColorChannel,
} from "./format-color.ts";
export { parseColor } from "./parse-color.ts";
