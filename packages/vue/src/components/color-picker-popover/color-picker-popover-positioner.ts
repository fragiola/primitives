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
import { ColorPickerPopoverKey } from "./color-picker-popover-context.ts";

export interface ColorPickerPopoverPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

/** Places the popup next to the trigger: below it, aligned to its start (a picker's default). */
export const ColorPickerPopoverPositioner: PartComponent<
    PositionerProps,
    ColorPickerPopoverPositionerState
> = publicComponent(
    defineComponent({
        name: "ColorPickerPopoverPositioner",
        inheritAttrs: false,
        props: { ...asProp, ...positionerProps },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ColorPickerPopoverKey,
                "ColorPickerPopover.Positioner",
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
                        "data-primitives-part":
                            "color-picker-popover-positioner",
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
