import { openOverlaySession } from "@fragiola/primitives/overlay";
import type { Align, Side } from "@fragiola/primitives/positioning";
import { defineComponent, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type { PositionerProps } from "../../composables/use-positioner.ts";
import {
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
import { CascadeSelectKey } from "./cascade-select-context.ts";

const NEVER = new Set<string>();

export interface CascadeSelectPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

/**
 * Places the popup below the trigger, as Select's (spec/cascade-select.md, "Positioning"); the
 * open popup is a layer (Escape, outside press).
 */
export const CascadeSelectPositioner: PartComponent<
    PositionerProps,
    CascadeSelectPositionerState
> = publicComponent(
    defineComponent({
        name: "CascadeSelectPositioner",
        inheritAttrs: false,
        props: {
            ...asProp,
            ...positionerProps,
            sideOffset: { type: Number, default: 4 },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CascadeSelectKey,
                "CascadeSelect.Positioner",
            );
            const setPositioner = elementSetter(context.positioner);
            const placed = usePositioner(
                props,
                { side: "bottom", align: "start" },
                context.trigger,
                context.positioner,
                null,
                context.presence.mounted,
            );
            watch(placed, (value) => (context.placed.value = value), {
                immediate: true,
            });
            watch(
                () => [context.open.value, context.positioner.value] as const,
                ([open, positioner], _, onCleanup) => {
                    if (!open || positioner === null) {
                        return;
                    }
                    const session = openOverlaySession(
                        positioner.ownerDocument,
                        {
                            elements: () => [positioner],
                            ignore: () => [context.trigger.value],
                            dismiss: (reason, event) =>
                                context.setOpen(false, reason, event),
                            returnFocus: {
                                when: NEVER,
                                reason: () => context.lastReason.current,
                                to: () => context.trigger.value,
                            },
                        },
                    );
                    onCleanup(session.end);
                },
                { flush: "post", immediate: true },
            );
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
                        "data-primitives-part": "cascade-select-positioner",
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
