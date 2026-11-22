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
import { NavigationMenuKey } from "./navigation-menu-context.ts";

/** Points at the open item's Trigger; placed along the popup's edge by the positioner. */
export const NavigationMenuArrow: PartComponent<
    Record<never, never>,
    { side: Side; align: Align }
> = publicComponent(
    defineComponent({
        name: "NavigationMenuArrow",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NavigationMenuKey,
                "NavigationMenu.Arrow",
            );
            const setArrow = elementSetter(context.arrow);
            return () => {
                const open = context.value.value !== null;
                const placed = context.placed.value;
                return renderPart("div", { attrs, slots }, props.as, placed, {
                    "aria-hidden": "true",
                    "data-primitives-part": "navigation-menu-arrow",
                    ...stateAttributes({
                        open,
                        closed: !open,
                        side: placed.side,
                        align: placed.align,
                    }),
                    ref: setArrow,
                });
            };
        },
    }),
);
