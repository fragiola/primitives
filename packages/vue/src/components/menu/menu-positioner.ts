import type { Align, Side } from "@fragiola/primitives/positioning";
import { computed, defineComponent, watch } from "vue";
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
                // a vertical bar's menus open at its end side, as submenus (spec/menubar.md)
                nested || context.bar?.orientation() === "vertical"
                    ? { side: "inline-end", align: "start" }
                    : { side: "bottom", align: "start" },
                // a context menu's point, else the trigger
                computed(() => context.anchor.value ?? context.trigger.value),
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
                        // a modal menu blocks the pointer outside; its levels take it back
                        style: context.modal()
                            ? { pointerEvents: "auto" }
                            : undefined,
                        "data-primitives-part": `${context.component}-positioner`,
                        ...stateAttributes({
                            open,
                            closed: !open,
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
