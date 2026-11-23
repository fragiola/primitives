import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CarouselContext, carouselSlideId } from "./carousel-context.ts";

/** What a slide renders with. */
export interface CarouselItemState {
    index: number;
    /** The slide is on the current page. */
    inView: boolean;
}

export interface CarouselItemProps extends PartProps<CarouselItemState> {
    /** Its slide, from 0. */
    index: number;
}

/**
 * One slide (spec/carousel.md): a `group` with the role description "slide" (a `tabpanel` in the
 * tabbed variant), the app naming it; out of view, `inert` and hidden from assistive technology.
 */
export function CarouselItem({ index, ...props }: CarouselItemProps) {
    const context = useRequiredContext(CarouselContext, "Carousel.Item");
    const inView = context.inView.has(index);
    const tabbed = context.variant === "tabbed";
    return renderElement(
        "div",
        props,
        { index, inView },
        {
            id: carouselSlideId(context.baseId, index),
            role: tabbed ? "tabpanel" : "group",
            "aria-roledescription": tabbed ? undefined : "slide",
            "aria-hidden": inView ? undefined : "true",
            inert: inView ? undefined : true,
            style: context.pages.includes(index)
                ? { scrollSnapAlign: "start" }
                : undefined,
            "data-index": String(index),
            "data-primitives-part": "carousel-item",
            ...stateAttributes({ inview: inView }),
        },
    );
}
