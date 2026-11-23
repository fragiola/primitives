import {
    type CarouselStepTriggerProps,
    useCarouselStepTrigger,
} from "./carousel-step-trigger.tsx";

export type CarouselNextTriggerProps = CarouselStepTriggerProps;

/** The page after (spec/carousel.md): disabled on the last page unless `loop`. */
export function CarouselNextTrigger(props: CarouselNextTriggerProps) {
    return useCarouselStepTrigger("next", "Carousel.NextTrigger", props);
}
