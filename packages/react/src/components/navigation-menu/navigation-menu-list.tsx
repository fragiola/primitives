import { getDirection } from "@fragiola/primitives/direction";
import { type KeyboardEvent, useContext } from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { NavigationMenuContext } from "./navigation-menu-context.ts";

const ITEM_TARGETS =
    ':scope > [data-primitives-part="navigation-menu-item"] > :is([data-primitives-part="navigation-menu-trigger"], [data-primitives-part="navigation-menu-link"])';

/**
 * The items (spec/navigation-menu.md, "Keyboard"): the arrow keys along the orientation move focus
 * between the items' Triggers and Links (mirrored in RTL), Home and End to the ends.
 */
export function NavigationMenuList(props: PartProps<{ orientation: string }>) {
    const context = useRequiredContext(
        NavigationMenuContext,
        "NavigationMenu.List",
    );
    const provided = useContext(DirectionContext);
    const { orientation, loopFocus } = context;
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        const list = event.currentTarget;
        const targets = [
            ...list.querySelectorAll<HTMLElement>(ITEM_TARGETS),
        ].filter((target) => !(target as HTMLButtonElement).disabled);
        const index = targets.indexOf(event.target as HTMLElement);
        // a key inside a Content (its portal bubbles here in React) is not the List's
        if (index === -1 || event.defaultPrevented) {
            return;
        }
        const rtl = getDirection(list, provided) === "rtl";
        const [next, previous] =
            orientation === "horizontal"
                ? rtl
                    ? ["ArrowLeft", "ArrowRight"]
                    : ["ArrowRight", "ArrowLeft"]
                : ["ArrowDown", "ArrowUp"];
        let target: number | null = null;
        if (event.key === next) {
            target =
                index + 1 < targets.length ? index + 1 : loopFocus ? 0 : index;
        } else if (event.key === previous) {
            target =
                index > 0 ? index - 1 : loopFocus ? targets.length - 1 : index;
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
    return renderElement(
        "ul",
        props,
        { orientation },
        {
            "data-primitives-part": "navigation-menu-list",
            ...stateAttributes({ orientation }),
            onKeyDown,
        },
    );
}
