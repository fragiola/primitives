// The entry of @fragiola/primitives/carousel: a carousel's pages (pure math), the scroll to a page and the page a scroll settled on, the mouse drag, the hover and focus watch, and the rotation's delay.

export {
    type CarouselPagesOptions,
    carouselPages,
    clampCarouselPage,
    slidesInView,
    stepCarouselPage,
} from "./carousel-pages.ts";
export {
    type CarouselOrientation,
    groupScrollPosition,
    nearestCarouselPage,
    slideScrollPosition,
} from "./carousel-scroll.ts";
export { createRotationTimer, type RotationTimer } from "./rotation-timer.ts";
export {
    type CarouselController,
    type CarouselWatchOptions,
    watchCarousel,
} from "./watch-carousel.ts";
