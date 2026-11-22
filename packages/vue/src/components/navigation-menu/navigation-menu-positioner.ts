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
import { NavigationMenuKey } from "./navigation-menu-context.ts";

/** Places the popup next to the open item's Trigger (spec/navigation-menu.md, "Positioning"). */
export interface NavigationMenuPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

export const NavigationMenuPositioner: PartComponent<
    PositionerProps,
    NavigationMenuPositionerState
> = publicComponent(
    defineComponent({
        name: "NavigationMenuPositioner",
        inheritAttrs: false,
        props: { ...asProp, ...positionerProps },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NavigationMenuKey,
                "NavigationMenu.Positioner",
            );
            const setPositioner = elementSetter(context.positioner);
            const placed = usePositioner(
                props,
                { side: "bottom", align: "center" },
                context.activeTrigger,
                context.positioner,
                context.arrow,
                context.presence.mounted,
            );
            watch(placed, (value) => (context.placed.value = value), {
                immediate: true,
            });
            return () => {
                const open = context.value.value !== null;
                const size = context.size.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open, ...placed.value },
                    {
                        role: "presentation",
                        "data-primitives-part": "navigation-menu-positioner",
                        ...stateAttributes({
                            open,
                            closed: !open,
                            side: placed.value.side,
                            align: placed.value.align,
                        }),
                        style: size
                            ? {
                                  "--positioner-width": `${size.width}px`,
                                  "--positioner-height": `${size.height}px`,
                              }
                            : undefined,
                        ref: setPositioner,
                    },
                );
            };
        },
    }),
);
