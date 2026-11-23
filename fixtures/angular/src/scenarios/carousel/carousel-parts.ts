import {
    CarouselAutoplayTrigger,
    CarouselIndicator,
    CarouselIndicatorGroup,
    CarouselItem,
    CarouselItemGroup,
    CarouselNextTrigger,
    CarouselPrevTrigger,
    CarouselRoot,
} from "@fragiola/primitives-angular/carousel";

/** Every Carousel directive, for a scenario's `imports`. */
export const CAROUSEL_PARTS = [
    CarouselRoot,
    CarouselItemGroup,
    CarouselItem,
    CarouselPrevTrigger,
    CarouselNextTrigger,
    CarouselIndicatorGroup,
    CarouselIndicator,
    CarouselAutoplayTrigger,
];
