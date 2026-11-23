import { defineComponent, shallowRef } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CarouselKey,
    carouselIndicatorId,
    carouselSlideId,
} from "./carousel-context.ts";
import { useNativeListener } from "./use-native-listener.ts";

/** What an Indicator renders with. */
export interface CarouselIndicatorState {
    /** Its page. */
    index: number;
    /** It is the current page's. */
    current: boolean;
}

export interface CarouselIndicatorProps {
    /** The page it picks, from 0. */
    index: number;
}

/**
 * Picks a page (spec/carousel.md): a button, `aria-disabled` while it is the current page's (the
 * APG's grouped style); in the tabbed variant a tab of the roving tab stop.
 */
export const CarouselIndicator: PartComponent<
    CarouselIndicatorProps,
    CarouselIndicatorState
> = publicComponent(
    defineComponent({
        name: "CarouselIndicator",
        inheritAttrs: false,
        props: { ...asProp, index: { type: Number, required: true } },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CarouselKey,
                "Carousel.Indicator",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            useNativeListener(element, "click", (event) => {
                if (props.index === context.state().page) {
                    return;
                }
                context.setPage(props.index, { reason: "item-press", event });
            });
            return () => {
                const index = props.index;
                const current = index === context.state().page;
                const tabbed = context.variant() === "tabbed";
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    { index, current },
                    {
                        type: "button",
                        id: carouselIndicatorId(context.baseId, index),
                        ...(tabbed
                            ? {
                                  role: "tab",
                                  "aria-selected": current ? "true" : "false",
                                  "aria-controls": carouselSlideId(
                                      context.baseId,
                                      index,
                                  ),
                                  tabindex: current ? 0 : -1,
                              }
                            : {
                                  "aria-disabled": current ? "true" : undefined,
                              }),
                        "data-primitives-part": "carousel-indicator",
                        ...stateAttributes({ current }),
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
