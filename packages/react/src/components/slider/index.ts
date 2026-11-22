// The entry of @fragiola/primitives-react/slider: a number, or a range of numbers, chosen along a
// track (spec/slider.md, the APG's slider and multi-thumb slider).

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export { Slider } from "./parts.ts";
export type { SliderState } from "./slider-context.ts";
export type { SliderRootProps } from "./slider-root.tsx";
export type { SliderThumbProps, SliderThumbState } from "./slider-thumb.tsx";
