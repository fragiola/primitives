import { CarouselAutoplayTrigger } from "./carousel-autoplay-trigger.tsx";
import { CarouselIndicator } from "./carousel-indicator.tsx";
import { CarouselIndicatorGroup } from "./carousel-indicator-group.tsx";
import { CarouselItem } from "./carousel-item.tsx";
import { CarouselItemGroup } from "./carousel-item-group.tsx";
import { CarouselNextTrigger } from "./carousel-next-trigger.tsx";
import { CarouselPrevTrigger } from "./carousel-prev-trigger.tsx";
import { CarouselRoot } from "./carousel-root.tsx";

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
