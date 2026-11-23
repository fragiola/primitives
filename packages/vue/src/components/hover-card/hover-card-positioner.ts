import type { Align, Side } from "@fragiola/primitives/positioning";
import { defineComponent, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import {
    type PositionerProps,
    positionerProps,
    usePositioner,
} from "../../composables/use-positioner.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { HoverCardKey } from "./hover-card-context.ts";

/** Places the popup next to its anchor (spec/hover-card.md, "Positioning"). */
export interface HoverCardPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

export const HoverCardPositioner: PartComponent<
    PositionerProps,
    HoverCardPositionerState
> = publicComponent(
    defineComponent({
        name: "HoverCardPositioner",
        inheritAttrs: false,
        props: { ...asProp, ...positionerProps },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                HoverCardKey,
                "HoverCard.Positioner",
            );
            const setPositioner = elementSetter(context.positioner);
            const placed = usePositioner(
                props,
                { side: "bottom", align: "center" },
                context.trigger,
                context.positioner,
                context.arrow,
                context.presence.mounted,
            );
            watch(placed, (value) => (context.placed.value = value), {
                immediate: true,
            });
            return () => {
                const open = context.open.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open, ...placed.value },
                    {
                        role: "presentation",
                        hidden: context.presence.mounted.value
                            ? undefined
                            : true,
                        "data-primitives-part": "hover-card-positioner",
                        ...stateAttributes({
                            open,
                            closed: !open,
                            side: placed.value.side,
                            align: placed.value.align,
                        }),
                        ref: setPositioner,
                    },
                );
            };
        },
    }),
);
