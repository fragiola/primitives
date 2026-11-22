import { getTabbables } from "@fragiola/primitives/focus";
import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePresence } from "../../hooks/use-presence.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    NavigationMenuContentContext,
    NavigationMenuContext,
    NavigationMenuItemContext,
} from "./navigation-menu-context.ts";

export interface NavigationMenuContentState {
    open: boolean;
    activationDirection: string;
}

/**
 * Its item's panel (spec/navigation-menu.md), rendered into the Viewport while its item is open
 * (and while the popup exits after it): its size is the popup's size variables.
 */
export function NavigationMenuContent(
    props: PartProps<NavigationMenuContentState>,
) {
    const context = useRequiredContext(
        NavigationMenuContext,
        "NavigationMenu.Content",
    );
    const item = useRequiredContext(
        NavigationMenuItemContext,
        "NavigationMenu.Content",
    );
    const [element, setElement] = useState<HTMLElement | null>(null);
    // the last open Content stays open while the popup closes; a switch closes the previous one
    const open =
        context.value === item.value ||
        (context.value === null && context.lastValue === item.value);
    const presence = usePresence(open, () => element);
    const { setContent } = item;
    useLayoutEffect(() => {
        setContent(element);
        return () => setContent(null);
    }, [element, setContent]);

    // the open Content's size is the popup's (its border box)
    const active = context.value === item.value;
    const { setSize, pendingFocus } = context;
    useLayoutEffect(() => {
        if (!active || element === null) {
            return undefined;
        }
        const measure = () =>
            setSize({
                width: element.offsetWidth,
                height: element.offsetHeight,
            });
        measure();
        if (pendingFocus.current === item.value) {
            pendingFocus.current = null;
            getTabbables(element)[0]?.focus();
        }
        const View = element.ownerDocument.defaultView?.ResizeObserver;
        if (View === undefined) {
            return undefined;
        }
        const observer = new View(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [active, element, setSize, pendingFocus, item.value]);

    if (!presence.mounted || context.viewport === null) {
        return null;
    }
    const status = presence.status;
    const state = {
        open,
        activationDirection: context.activationDirection,
    };
    return createPortal(
        <NavigationMenuContentContext.Provider value={true}>
            {renderElement(
                "div",
                props,
                state,
                {
                    id: item.contentId,
                    "data-primitives-part": "navigation-menu-content",
                    ...stateAttributes({
                        open,
                        closed: !open,
                        "activation-direction": context.activationDirection,
                        "starting-style": status === "starting",
                        "ending-style": status === "ending",
                    }),
                },
                setElement,
            )}
        </NavigationMenuContentContext.Provider>,
        context.viewport,
    );
}
