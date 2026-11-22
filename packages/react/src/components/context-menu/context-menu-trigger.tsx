import { watchLongPress } from "@fragiola/primitives/pointer";
import { type KeyboardEvent, type MouseEvent, useEffect, useRef } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { mergeRefs } from "../../utils/merge-refs.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { MenuContext } from "../menu/menu-context.ts";
import { ContextMenuContext } from "./context-menu-context.ts";

export interface ContextMenuTriggerState {
    open: boolean;
    disabled: boolean;
}

// The keyboard's own `contextmenu` event follows the key that opened the menu within this time.
const KEYBOARD_EVENT_WINDOW = 300;

/** A key that opens a context menu from the keyboard (spec/context-menu.md, "Keyboard"). */
function isMenuKey(event: KeyboardEvent): boolean {
    return (
        event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)
    );
}

/**
 * The area a right-click, a touch long press, or the `ContextMenu` key and Shift+F10 open the
 * menu from (spec/context-menu.md): no button, no role.
 */
export function ContextMenuTrigger(props: PartProps<ContextMenuTriggerState>) {
    const menu = useRequiredContext(MenuContext, "ContextMenu.Trigger");
    const context = useRequiredContext(
        ContextMenuContext,
        "ContextMenu.Trigger",
    );
    const [element, ref] = useElement<HTMLElement>();
    const keyboardAt = useRef(Number.NEGATIVE_INFINITY);
    const { disabled, openAt } = context;

    // a touch held still for 500 ms opens it at the press point
    useEffect(() => {
        if (element === null || disabled) {
            return undefined;
        }
        return watchLongPress(element, {
            onLongPress: (point, event) =>
                openAt(point, "trigger-press", event, element, null),
        });
    }, [element, disabled, openAt]);

    // a portaled popup's events bubble through React's tree: only the area's own count
    const inArea = (target: EventTarget) =>
        element !== null && target instanceof Node && element.contains(target);
    const state = { open: menu.open, disabled };
    return renderElement(
        "div",
        props,
        state,
        {
            "data-primitives-part": "context-menu-trigger",
            ...stateAttributes({ "popup-open": menu.open, disabled }),
            onContextMenu: (event: MouseEvent<HTMLElement>) => {
                if (disabled || element === null || !inArea(event.target)) {
                    return;
                }
                event.preventDefault();
                // the browser's own event after a key that already opened the menu
                if (
                    event.timeStamp - keyboardAt.current <
                    KEYBOARD_EVENT_WINDOW
                ) {
                    return;
                }
                openAt(
                    { x: event.clientX, y: event.clientY },
                    "trigger-press",
                    event.nativeEvent,
                    element,
                    null,
                );
            },
            onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
                if (
                    disabled ||
                    element === null ||
                    !isMenuKey(event) ||
                    !inArea(event.target)
                ) {
                    return;
                }
                event.preventDefault();
                keyboardAt.current = event.timeStamp;
                const focused = element.ownerDocument.activeElement;
                openAt(
                    focused !== null && element.contains(focused)
                        ? focused
                        : element,
                    "list-navigation",
                    event.nativeEvent,
                    element,
                    "first",
                );
            },
            onKeyUp: (event: KeyboardEvent<HTMLElement>) => {
                // some platforms send the menu key's `contextmenu` on its release
                if (!disabled && isMenuKey(event) && inArea(event.target)) {
                    keyboardAt.current = event.timeStamp;
                }
            },
        },
        mergeRefs(ref, menu.setTrigger),
    );
}
