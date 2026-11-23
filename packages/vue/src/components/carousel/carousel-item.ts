import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CarouselKey, carouselSlideId } from "./carousel-context.ts";

/** What a slide renders with. */
export interface CarouselItemState {
    index: number;
    /** The slide is on the current page. */
    inView: boolean;
}

export interface CarouselItemProps {
    /** Its slide, from 0. */
    index: number;
}

/**
 * One slide (spec/carousel.md): a `group` with the role description "slide" (a `tabpanel` in the
 * tabbed variant), the app naming it; out of view, `inert` and hidden from assistive technology.
 */
export const CarouselItem: PartComponent<CarouselItemProps, CarouselItemState> =
    publicComponent(
        defineComponent({
            name: "CarouselItem",
            inheritAttrs: false,
            props: { ...asProp, index: { type: Number, required: true } },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(
                    CarouselKey,
                    "Carousel.Item",
                );
                return () => {
                    const index = props.index;
                    const inView = context.inView().has(index);
                    const tabbed = context.variant() === "tabbed";
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        { index, inView },
                        {
                            id: carouselSlideId(context.baseId, index),
                            role: tabbed ? "tabpanel" : "group",
                            "aria-roledescription": tabbed
                                ? undefined
                                : "slide",
                            "aria-hidden": inView ? undefined : "true",
                            inert: inView ? undefined : true,
                            style: context.pages().includes(index)
                                ? { scrollSnapAlign: "start" }
                                : undefined,
                            "data-index": String(index),
                            "data-primitives-part": "carousel-item",
                            ...stateAttributes({ inview: inView }),
                        },
                    );
                };
            },
        }),
    );
