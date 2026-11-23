import { CarouselAutoplayTrigger } from "./carousel-autoplay-trigger.ts";
import { CarouselIndicator } from "./carousel-indicator.ts";
import { CarouselIndicatorGroup } from "./carousel-indicator-group.ts";
import { CarouselItem } from "./carousel-item.ts";
import { CarouselItemGroup } from "./carousel-item-group.ts";
import { CarouselNextTrigger } from "./carousel-next-trigger.ts";
import { CarouselPrevTrigger } from "./carousel-prev-trigger.ts";
import { CarouselRoot } from "./carousel-root.ts";

/** spec/carousel.md */
export const Carousel = {
    Root: CarouselRoot,
    ItemGroup: CarouselItemGroup,
    Item: CarouselItem,
    PrevTrigger: CarouselPrevTrigger,
    NextTrigger: CarouselNextTrigger,
    IndicatorGroup: CarouselIndicatorGroup,
    Indicator: CarouselIndicator,
    AutoplayTrigger: CarouselAutoplayTrigger,
};
