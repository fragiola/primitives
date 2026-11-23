import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CarouselKey,
    type CarouselState,
    carouselGroupId,
} from "./carousel-context.ts";

/** A slide's share of the group, less the spacing (spec/carousel.md, "State attributes"). */
const SLIDE_SIZE =
    "calc((100% - var(--carousel-spacing) * (var(--carousel-slides-per-page) - 1)) / var(--carousel-slides-per-page))";

/** The structural style of the slides' scroll container, on its axis. */
export function itemGroupStyle(
    orientation: "horizontal" | "vertical",
): Record<string, string> {
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
export const CarouselItemGroup: PartComponent<
    Record<never, never>,
    CarouselState
> = publicComponent(
    defineComponent({
        name: "CarouselItemGroup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CarouselKey,
                "Carousel.ItemGroup",
            );
            return () => {
                const state = context.state();
                return renderPart("div", { attrs, slots }, props.as, state, {
                    id: carouselGroupId(context.baseId),
                    "aria-live": state.playing ? "off" : "polite",
                    "aria-atomic": "false",
                    tabindex: context.groupTabStop() ? 0 : undefined,
                    style: itemGroupStyle(state.orientation),
                    "data-primitives-part": "carousel-item-group",
                    ...stateAttributes({
                        orientation: state.orientation,
                        dragging: state.dragging,
                    }),
                    ref: context.setGroup,
                });
            };
        },
    }),
);
