// The entry of @fragiola/primitives-vue/slider: a number, or a range of numbers, chosen along a
// track (spec/slider.md, the APG's slider and multi-thumb slider).

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { Slider } from "./parts.ts";
export type { SliderState } from "./slider-context.ts";
export type { SliderLabelProps } from "./slider-label.ts";
export type { SliderRootEmits, SliderRootProps } from "./slider-root.ts";
export type { SliderThumbProps, SliderThumbState } from "./slider-thumb.ts";
export type {
    SliderValueSlotProps,
    SliderValueSlots,
} from "./slider-value.ts";
