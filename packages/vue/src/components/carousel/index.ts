// The entry of @fragiola/primitives-vue/carousel: the APG carousel, basic or tabbed, its slides
// scrolling natively a page at a time, with a rotation that focus stops and a hover pauses
// (spec/carousel.md). Its DOM side is the toolkit's `/carousel`.

export type { CarouselOrientation } from "@fragiola/primitives/carousel";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { CarouselAutoplayTriggerState } from "./carousel-autoplay-trigger.ts";
export type { CarouselState } from "./carousel-context.ts";
export type {
    CarouselIndicatorProps,
    CarouselIndicatorState,
} from "./carousel-indicator.ts";
export type { CarouselItemProps, CarouselItemState } from "./carousel-item.ts";
export type { CarouselRootEmits, CarouselRootProps } from "./carousel-root.ts";
export type { CarouselStepTriggerState } from "./carousel-step-trigger.ts";
export { Carousel } from "./parts.ts";
