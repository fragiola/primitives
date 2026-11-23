import type { CSSProperties } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CarouselContext,
    type CarouselState,
    carouselGroupId,
} from "./carousel-context.ts";

export type CarouselItemGroupProps = PartProps<CarouselState>;

/** A slide's share of the group, less the spacing (spec/carousel.md, "State attributes"). */
const SLIDE_SIZE =
    "calc((100% - var(--carousel-spacing) * (var(--carousel-slides-per-page) - 1)) / var(--carousel-slides-per-page))";

/** The structural style of the slides' scroll container, on its axis. */
export function itemGroupStyle(
    orientation: "horizontal" | "vertical",
): CSSProperties {
    return orientation === "vertical"
        ? {
              display: "grid",
              gridAutoFlow: "row",
              gridAutoRows: SLIDE_SIZE,
              gap: "var(--carousel-spacing)",
              overflowY: "auto",
              overscrollBehaviorY: "contain",
              scrollSnapType: "y mandatory",
              scrollbarWidth: "none",
          }
        : {
              display: "grid",
              gridAutoFlow: "column",
              gridAutoColumns: SLIDE_SIZE,
              gap: "var(--carousel-spacing)",
              overflowX: "auto",
              overscrollBehaviorX: "contain",
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
          };
}

/**
 * The slides' scroll container and live region (spec/carousel.md): `aria-live="off"` while the
 * slides rotate, `"polite"` otherwise.
 */
export function CarouselItemGroup(props: CarouselItemGroupProps) {
    const context = useRequiredContext(CarouselContext, "Carousel.ItemGroup");
    const { page, pageCount, orientation, playing, paused, dragging } = context;
    return renderElement(
        "div",
        props,
        { page, pageCount, orientation, playing, paused, dragging },
        {
            id: carouselGroupId(context.baseId),
            "aria-live": playing ? "off" : "polite",
            "aria-atomic": "false",
            tabIndex: context.groupTabStop ? 0 : undefined,
            style: itemGroupStyle(orientation),
            "data-primitives-part": "carousel-item-group",
            ...stateAttributes({ orientation, dragging }),
        },
        context.setGroup,
    );
}
