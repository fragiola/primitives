// The entry of @fragiola/primitives-angular/carousel: the APG carousel, basic or tabbed, its slides
// scrolling natively a page at a time, with a rotation that focus stops and a hover pauses
// (spec/carousel.md), as standalone attribute directives on the consumer's own elements. Its DOM
// side is the toolkit's `/carousel`.

export type { CarouselOrientation } from "@fragiola/primitives/carousel";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export {
    CarouselAutoplayTrigger,
    type CarouselAutoplayTriggerState,
} from "./directives/carousel-autoplay-trigger.directive.ts";
export {
    CarouselIndicator,
    type CarouselIndicatorState,
} from "./directives/carousel-indicator.directive.ts";
export { CarouselIndicatorGroup } from "./directives/carousel-indicator-group.directive.ts";
export {
    CarouselItem,
    type CarouselItemState,
} from "./directives/carousel-item.directive.ts";
export { CarouselItemGroup } from "./directives/carousel-item-group.directive.ts";
export { CarouselNextTrigger } from "./directives/carousel-next-trigger.directive.ts";
export { CarouselPrevTrigger } from "./directives/carousel-prev-trigger.directive.ts";
export {
    CarouselRoot,
    type CarouselState,
} from "./directives/carousel-root.directive.ts";
export type { CarouselStepTriggerState } from "./utils/carousel-step-trigger.ts";
