import type { Align, Side } from "@fragiola/primitives/positioning";
import { defineComponent } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { HoverCardKey } from "./hover-card-context.ts";

/** Points at the anchor; placed along the popup's edge by the positioner. */
export interface HoverCardArrowState {
    side: Side;
    align: Align;
}

export const HoverCardArrow: PartComponent<
    Record<never, never>,
    HoverCardArrowState
> = publicComponent(
    defineComponent({
        name: "HoverCardArrow",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(HoverCardKey, "HoverCard.Arrow");
            const setArrow = elementSetter(context.arrow);
            return () => {
                const placed = context.placed.value;
                return renderPart("div", { attrs, slots }, props.as, placed, {
                    "aria-hidden": "true",
                    "data-primitives-part": "hover-card-arrow",
                    ...stateAttributes({
                        open: context.open.value,
                        closed: !context.open.value,
                        side: placed.side,
                        align: placed.align,
                    }),
                    ref: setArrow,
                });
            };
        },
    }),
);
