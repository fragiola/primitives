import type { KeyboardEvent, MouseEvent } from "react";
import {
    type OverlayTriggerProps,
    useOverlayTrigger,
} from "../../hooks/use-overlay-trigger.ts";
import type { ChangeReason } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { MenuContext } from "./menu-context.ts";
import type { MenuHandle } from "./menu-handle.ts";

export interface MenuTriggerState {
    open: boolean;
    disabled: boolean;
}

export interface MenuTriggerProps<Payload = unknown>
    extends PartProps<MenuTriggerState>,
        OverlayTriggerProps<MenuHandle<Payload>, Payload> {
    disabled?: boolean;
}

/**
 * Opens the root menu (spec/menu.md, "Keyboard": on the Trigger); with a `handle`, from anywhere
 * in the page.
 */
export function MenuTrigger<Payload = unknown>({
    disabled = false,
    handle,
    payload,
    id: idProp,
    ...props
}: MenuTriggerProps<Payload>) {
    const { root, id, ref, active } = useOverlayTrigger(
        MenuContext,
        "Menu.Trigger",
        { handle, payload, id: idProp },
    );
    const state = { open: active, disabled };
    const openWith = (
        highlight: "first" | "last",
        reason: ChangeReason,
        event: KeyboardEvent<HTMLElement>,
    ) => {
        // already open from this trigger: nothing to open, and no highlight left for a later open
        // (spec/menu.md)
        if (root === null || active) {
            return;
        }
        root.pendingHighlight.current = highlight;
        if (
            !root.setOpen(true, reason, event.nativeEvent, event.currentTarget)
        ) {
            root.pendingHighlight.current = null;
        }
    };
    return renderElement(
        "button",
        props,
        state,
        {
            type: "button",
            id,
            disabled,
            "aria-haspopup": "menu",
            "aria-expanded": active,
            "aria-controls": active ? root?.popupId : undefined,
            // a modal menu blocks the pointer outside; its triggers still toggle (spec/menu.md)
            style:
                root?.modal && root.open
                    ? { pointerEvents: "auto" }
                    : undefined,
            "data-primitives-part": "menu-trigger",
            ...stateAttributes({ "popup-open": active, disabled }),
            onClick: (event: MouseEvent<HTMLElement>) => {
                if (root === null) {
                    return;
                }
                root.pendingHighlight.current = null;
                root.setOpen(
                    !active,
                    "trigger-press",
                    event.nativeEvent,
                    event.currentTarget,
                );
            },
            onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
                if (event.key === "ArrowDown") {
                    event.preventDefault();
                    openWith("first", "list-navigation", event);
                } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    openWith("last", "list-navigation", event);
                } else if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openWith("first", "trigger-press", event);
                }
            },
            onKeyUp: (event: KeyboardEvent) => {
                if (event.key === " ") {
                    event.preventDefault();
                }
            },
        },
        ref,
    );
}
