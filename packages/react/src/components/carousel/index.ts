// The entry of @fragiola/primitives-react/carousel: the APG carousel, basic or tabbed, its slides
// scrolling natively a page at a time, with a rotation that focus stops and a hover pauses
// (spec/carousel.md). Its DOM side is the toolkit's `/carousel`.

export type { CarouselOrientation } from "@fragiola/primitives/carousel";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type {
    CarouselAutoplayTriggerProps,
    CarouselAutoplayTriggerState,
} from "./carousel-autoplay-trigger.tsx";
export type { CarouselState } from "./carousel-context.ts";
export type {
    CarouselIndicatorProps,
    CarouselIndicatorState,
} from "./carousel-indicator.tsx";
export type { CarouselIndicatorGroupProps } from "./carousel-indicator-group.tsx";
export type { CarouselItemProps, CarouselItemState } from "./carousel-item.tsx";
export type { CarouselItemGroupProps } from "./carousel-item-group.tsx";
export type { CarouselNextTriggerProps } from "./carousel-next-trigger.tsx";
export type { CarouselPrevTriggerProps } from "./carousel-prev-trigger.tsx";
export type { CarouselRootProps } from "./carousel-root.tsx";
export type {
    CarouselStepTriggerProps,
    CarouselStepTriggerState,
} from "./carousel-step-trigger.tsx";
export { Carousel } from "./parts.ts";
