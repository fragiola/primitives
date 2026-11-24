// The entry of @fragiola/primitives-vue/color-slider: one channel of a color chosen along a
// track that shows it (spec/color-slider.md, the APG slider, on the toolkit's /color).

export type {
    Color,
    ColorChannel,
    ColorSpace,
    HsbColor,
    HslColor,
    RgbColor,
} from "@fragiola/primitives/color";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { ColorSliderState } from "./color-slider-context.ts";
export type { ColorSliderLabelProps } from "./color-slider-label.ts";
export type {
    ColorSliderRootEmits,
    ColorSliderRootProps,
} from "./color-slider-root.ts";
export type { ColorSliderThumbProps } from "./color-slider-thumb.ts";
export { ColorSlider } from "./parts.ts";
