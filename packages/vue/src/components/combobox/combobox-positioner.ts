import { openOverlaySession } from "@fragiola/primitives/overlay";
import type { Align, Side } from "@fragiola/primitives/positioning";
import { computed, defineComponent, watch } from "vue";
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
import { ComboboxKey } from "./combobox-context.ts";

export interface ComboboxPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

/**
 * Places the list under the InputGroup (else the Chips, else the Input); the open list is a layer
 * (Escape, outside press).
 */
export const ComboboxPositioner: PartComponent<
    PositionerProps,
    ComboboxPositionerState
> = publicComponent(
    defineComponent({
        name: "ComboboxPositioner",
        inheritAttrs: false,
        props: { ...asProp, ...positionerProps },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ComboboxKey,
                "Combobox.Positioner",
            );
            const setPositioner = elementSetter(context.positioner);
            const anchor = computed(
                () =>
                    context.inputGroup.value ??
                    context.chips.value ??
                    context.trigger.value,
            );
            const placed = usePositioner(
                props,
                { side: "bottom", align: "start" },
                anchor,
                context.positioner,
                null,
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
                            ignore: () => [
                                context.trigger.value,
                                context.button.value,
                                context.inputGroup.value,
                                context.chips.value,
                                context.clearButton.value,
                            ],
                            dismiss: (reason) => context.setOpen(false, reason),
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
                        "data-primitives-part": "combobox-positioner",
                        ...stateAttributes({
                            open,
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
