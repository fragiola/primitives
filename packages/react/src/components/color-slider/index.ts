// The entry of @fragiola/primitives-react/color-slider: one channel of a color chosen along a
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
export type { RenderProp } from "../../utils/render-element.tsx";
export type { ColorSliderState } from "./color-slider-context.ts";
export type { ColorSliderLabelProps } from "./color-slider-label.tsx";
export type { ColorSliderOutputProps } from "./color-slider-output.tsx";
export type { ColorSliderRootProps } from "./color-slider-root.tsx";
export type { ColorSliderThumbProps } from "./color-slider-thumb.tsx";
export { ColorSlider } from "./parts.ts";
