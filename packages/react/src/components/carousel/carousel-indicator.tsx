import type { MouseEvent, MouseEventHandler } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CarouselContext,
    carouselIndicatorId,
    carouselSlideId,
} from "./carousel-context.ts";

/** What an Indicator renders with. */
export interface CarouselIndicatorState {
    /** Its page. */
    index: number;
    /** It is the current page's. */
    current: boolean;
}

export interface CarouselIndicatorProps
    extends PartProps<CarouselIndicatorState> {
    /** The page it picks, from 0. */
    index: number;
    onClick?: MouseEventHandler<HTMLElement>;
}

/**
 * Picks a page (spec/carousel.md): a button, `aria-disabled` while it is the current page's (the
 * APG's grouped style); in the tabbed variant a tab of the roving tab stop.
 */
export function CarouselIndicator({
    index,
    onClick,
    ...props
}: CarouselIndicatorProps) {
    const context = useRequiredContext(CarouselContext, "Carousel.Indicator");
    const current = index === context.page;
    const tabbed = context.variant === "tabbed";
    return renderElement(
        "button",
        props,
        { index, current },
        {
            type: "button",
            id: carouselIndicatorId(context.baseId, index),
            ...(tabbed
                ? {
                      role: "tab",
                      "aria-selected": current ? "true" : "false",
                      "aria-controls": carouselSlideId(context.baseId, index),
                      tabIndex: current ? 0 : -1,
                  }
                : { "aria-disabled": current ? "true" : undefined }),
            onClick: (event: MouseEvent<HTMLElement>) => {
                if (current) {
                    return;
                }
                context.setPage(index, {
                    reason: "item-press",
                    event: event.nativeEvent,
                });
                onClick?.(event);
            },
            "data-primitives-part": "carousel-indicator",
            ...stateAttributes({ current }),
        },
    );
}
