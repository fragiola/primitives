import {
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react";
import {
    type OverlayTriggerProps,
    useOverlayTrigger,
} from "../../hooks/use-overlay-trigger.ts";
import { useRovingItem } from "../../hooks/use-roving-item.ts";
import type { ChangeReason } from "../../utils/change-details.ts";
import { mergeRefs } from "../../utils/merge-refs.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import type { MenuBarEntry } from "./menu-bar-context.ts";
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
 * in the page. In a Menubar, an item of the bar that hands its keys, press and hover to it
 * (spec/menu.md, "In a Menubar").
 */
export function MenuTrigger<Payload = unknown>({
    disabled = false,
    handle,
    payload,
    id: idProp,
    ...props
}: MenuTriggerProps<Payload>) {
    const { root, id, element, ref, active } = useOverlayTrigger(
        MenuContext,
        "Menu.Trigger",
        { handle, payload, id: idProp },
    );
    // in a bar: the bar's item (its roving tab stop, its menu registered with it)
    const bar = root?.parent === null ? root.bar : null;
    const disabledNow = disabled || (bar?.disabled ?? false);
    const roving = useRovingItem(() => true, bar ? bar.scope : null);
    const entry = useRef<MenuBarEntry | null>(null);
    if (root !== null) {
        entry.current = { menu: root, disabled: disabledNow };
    }
    const register = bar?.register;
    useLayoutEffect(() => {
        const current = entry.current;
        if (register === undefined || element === null || current === null) {
            return undefined;
        }
        return register(element, entry as { readonly current: MenuBarEntry });
    }, [register, element]);
    const state = { open: active, disabled: disabledNow };
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
    const own = {
        disabled,
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
    };
    // in a bar: a focusable disabled item; its keys reach the bar's element, its press and its
    // hover go to the bar, the consumer's click handler does not run while disabled
    const inBar = bar && {
        role: "menuitem",
        tabIndex: roving.tabIndex,
        "aria-disabled": disabledNow ? "true" : undefined,
        onFocus: (_event: FocusEvent<HTMLElement>) => roving.onFocus(),
        onClick: (event: MouseEvent<HTMLElement>) =>
            bar.press(event.currentTarget, event),
        onPointerEnter: (event: PointerEvent<HTMLElement>) =>
            bar.hover(event.currentTarget, event),
    };
    const rovingRef = roving.ref;
    const mergedRef = useMemo(
        () => mergeRefs(ref, rovingRef),
        [ref, rovingRef],
    );
    const consumer =
        inBar && disabledNow ? { ...props, onClick: undefined } : props;
    return renderElement(
        "button",
        consumer,
        state,
        {
            type: "button",
            id,
            "aria-haspopup": "menu",
            "aria-expanded": active,
            "aria-controls": active ? root?.popupId : undefined,
            // a modal menu blocks the pointer outside; its triggers still toggle (spec/menu.md)
            style:
                root?.modal && root.open
                    ? { pointerEvents: "auto" }
                    : undefined,
            "data-primitives-part": "menu-trigger",
            ...stateAttributes({ "popup-open": active, disabled: disabledNow }),
            ...(inBar || own),
            onKeyUp: (event: KeyboardEvent) => {
                if (event.key === " ") {
                    event.preventDefault();
                }
            },
        },
        mergedRef,
    );
}
