import { getDirection } from "@fragiola/primitives/direction";
import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { NavigationMenuKey } from "./navigation-menu-context.ts";

const ITEM_TARGETS =
    ':scope > [data-primitives-part="navigation-menu-item"] > :is([data-primitives-part="navigation-menu-trigger"], [data-primitives-part="navigation-menu-link"])';

/**
 * The items (spec/navigation-menu.md, "Keyboard"): the arrow keys along the orientation move focus
 * between the items' Triggers and Links (mirrored in RTL), Home and End to the ends.
 */
export interface NavigationMenuListState {
    orientation: string;
}

export const NavigationMenuList: PartComponent<
    Record<never, never>,
    NavigationMenuListState
> = publicComponent(
    defineComponent({
        name: "NavigationMenuList",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NavigationMenuKey,
                "NavigationMenu.List",
            );
            const provided = useProvidedDirection();
            const onKeydown = (event: KeyboardEvent) => {
                const list = event.currentTarget as HTMLElement;
                const targets = [
                    ...list.querySelectorAll<HTMLElement>(ITEM_TARGETS),
                ].filter((target) => !(target as HTMLButtonElement).disabled);
                const index = targets.indexOf(event.target as HTMLElement);
                if (index === -1 || event.defaultPrevented) {
                    return;
                }
                const loop = context.loopFocus();
                const rtl = getDirection(list, provided()) === "rtl";
                const [next, previous] =
                    context.orientation() === "horizontal"
                        ? rtl
                            ? ["ArrowLeft", "ArrowRight"]
                            : ["ArrowRight", "ArrowLeft"]
                        : ["ArrowDown", "ArrowUp"];
                let target: number | null = null;
                if (event.key === next) {
                    target =
                        index + 1 < targets.length
                            ? index + 1
                            : loop
                              ? 0
                              : index;
                } else if (event.key === previous) {
                    target =
                        index > 0
                            ? index - 1
                            : loop
                              ? targets.length - 1
                              : index;
                } else if (event.key === "Home") {
                    target = 0;
                } else if (event.key === "End") {
                    target = targets.length - 1;
                }
                if (target === null) {
                    return;
                }
                event.preventDefault();
                targets[target]?.focus();
            };
            return () => {
                const orientation = context.orientation();
                return renderPart(
                    "ul",
                    { attrs, slots },
                    props.as,
                    { orientation },
                    {
                        "data-primitives-part": "navigation-menu-list",
                        ...stateAttributes({ orientation }),
                        onKeydown,
                    },
                );
            };
        },
    }),
);
