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
import { MenuKey } from "./menu-context.ts";

/** Places a menu level: below its trigger, or at the end side of its submenu trigger. */
export interface MenuPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

export const MenuPositioner: PartComponent<
    PositionerProps,
    MenuPositionerState
> = publicComponent(
    defineComponent({
        name: "MenuPositioner",
        inheritAttrs: false,
        props: { ...asProp, ...positionerProps },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(MenuKey, "Menu.Positioner");
            const nested = context.parent !== null;
            const setPositioner = elementSetter(context.positioner);
            const placed = usePositioner(
                props,
                nested
                    ? { side: "inline-end", align: "start" }
                    : { side: "bottom", align: "start" },
                context.trigger,
                context.positioner,
                null,
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
                        // a modal menu blocks the pointer outside; its levels take it back
                        style: context.modal()
                            ? { pointerEvents: "auto" }
                            : undefined,
                        "data-primitives-part": "menu-positioner",
                        ...stateAttributes({
                            open,
                            side: placed.value.side,
                            align: placed.value.align,
                            nested,
                        }),
                        ref: setPositioner,
                    },
                );
            };
        },
    }),
);
