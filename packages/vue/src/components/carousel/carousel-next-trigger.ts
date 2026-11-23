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

/** The page after (spec/carousel.md): disabled on the last page unless `loop`. */
export const CarouselNextTrigger: PartComponent<
    Record<never, never>,
    CarouselStepTriggerState
> = publicComponent(
    defineComponent({
        name: "CarouselNextTrigger",
        inheritAttrs: false,
        props: asProp,
        setup: (props, context) =>
            setupCarouselStepTrigger(
                "next",
                "Carousel.NextTrigger",
                props,
                context,
            ),
    }),
);
