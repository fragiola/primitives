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
import { TooltipKey } from "./tooltip-context.ts";

/** Points at the anchor; placed along the popup's edge by the positioner. */
export interface TooltipArrowState {
    side: Side;
    align: Align;
}

export const TooltipArrow: PartComponent<
    Record<never, never>,
    TooltipArrowState
> = publicComponent(
    defineComponent({
        name: "TooltipArrow",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(TooltipKey, "Tooltip.Arrow");
            const setArrow = elementSetter(context.arrow);
            return () => {
                const placed = context.placed.value;
                return renderPart("div", { attrs, slots }, props.as, placed, {
                    "aria-hidden": "true",
                    "data-primitives-part": "tooltip-arrow",
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
