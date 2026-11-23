import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp } from "../../utils/render-part.ts";
import {
    type CarouselStepTriggerState,
    setupCarouselStepTrigger,
} from "./carousel-step-trigger.ts";

/** The page before (spec/carousel.md): disabled on the first page unless `loop`. */
export const CarouselPrevTrigger: PartComponent<
    Record<never, never>,
    CarouselStepTriggerState
> = publicComponent(
    defineComponent({
        name: "CarouselPrevTrigger",
        inheritAttrs: false,
        props: asProp,
        setup: (props, context) =>
            setupCarouselStepTrigger(
                "prev",
                "Carousel.PrevTrigger",
                props,
                context,
            ),
    }),
);
