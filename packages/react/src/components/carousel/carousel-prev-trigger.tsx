import {
    type CarouselStepTriggerProps,
    useCarouselStepTrigger,
} from "./carousel-step-trigger.tsx";

export type CarouselPrevTriggerProps = CarouselStepTriggerProps;

/** The page before (spec/carousel.md): disabled on the first page unless `loop`. */
export function CarouselPrevTrigger(props: CarouselPrevTriggerProps) {
    return useCarouselStepTrigger("prev", "Carousel.PrevTrigger", props);
}
