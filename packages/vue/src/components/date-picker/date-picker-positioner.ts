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
import { DatePickerKey } from "./date-picker-context.ts";

export interface DatePickerPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

/** Places the popup next to the trigger (spec/calendar.md, "Positioning"). */
export const DatePickerPositioner: PartComponent<
    PositionerProps,
    DatePickerPositionerState
> = publicComponent(
    defineComponent({
        name: "DatePickerPositioner",
        inheritAttrs: false,
        props: { ...asProp, ...positionerProps },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                DatePickerKey,
                "DatePicker.Positioner",
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
                        "data-primitives-part": `${context.component}-positioner`,
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
