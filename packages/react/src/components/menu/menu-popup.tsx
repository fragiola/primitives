import { menuKeyTarget, submenuKeys } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    nextTabbableAfter,
    previousTabbableBefore,
} from "@fragiola/primitives/focus";
import { blockOutsidePointer } from "@fragiola/primitives/inert";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import { lockScroll } from "@fragiola/primitives/scroll-lock";
import { type KeyboardEvent, useContext, useEffect, useRef } from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { MenuContext, type MenuContextValue } from "./menu-context.ts";
import { menuItems } from "./menu-items.ts";

const ROOT_RETURNS_FOCUS = new Set([
    "escape-key",
    "item-press",
    "trigger-press",
]);
const SUBMENU_RETURNS_FOCUS = new Set(["escape-key", "list-navigation"]);
// a modal menu's outside press reaches nothing, so focus goes back to the trigger
const MODAL_RETURNS_FOCUS_UNFOCUSED = new Set(["outside-press", "none"]);
// a root menu closed through the controlled `open` (reason `none`) returns focus left inside it,
// as Popover does; so does a handle's or the actions' close (`imperative-action`)
const RETURNS_FOCUS_UNFOCUSED = new Set(["none", "imperative-action"]);

function rootOf(context: MenuContextValue): MenuContextValue {
    return context.parent ? rootOf(context.parent) : context;
}

/** Every positioner of the chain of open levels, for Tab to skip. */
function positioners(context: MenuContextValue): (HTMLElement | null)[] {
    const own = [context.positioner];
    return context.parent ? [...positioners(context.parent), ...own] : own;
}

/** One menu level: roving focus, typeahead, Escape per level (spec/menu.md). */
export function MenuPopup(
    props: PartProps<{ open: boolean; side: string; align: string }>,
) {
    const context = useRequiredContext(MenuContext, "Menu.Popup");
    const direction = useContext(DirectionContext);
    const {
        open,
        popup,
        positioner,
        trigger,
        setOpen,
        lastReason,
        pendingHighlight,
    } = context;
    const nested = context.parent !== null;
    const modal = context.modal && !nested;
    const modalNow = useRef(modal);
    modalNow.current = modal;
    // read when the session needs them: the active trigger may move while it is open
    const triggers = useRef(context);
    triggers.current = context;

    useEffect(() => {
        if (!open || popup === null) {
            return undefined;
        }
        // Escape, an item and the trigger give focus back to this level's trigger; the closing
        // arrow of a submenu gives it back to its submenu trigger
        const doc = popup.ownerDocument;
        const session = openOverlaySession(doc, {
            elements: () => [positioner ?? popup],
            ignore: () => triggers.current.triggers,
            dismiss: (reason, event) => setOpen(false, reason, event),
            returnFocus: {
                when: nested ? SUBMENU_RETURNS_FOCUS : ROOT_RETURNS_FOCUS,
                whenUnfocused: () =>
                    modalNow.current
                        ? MODAL_RETURNS_FOCUS_UNFOCUSED
                        : RETURNS_FOCUS_UNFOCUSED,
                reason: () => lastReason.current ?? (nested ? null : "none"),
                to: () => triggers.current.trigger,
            },
        });
        return session.end;
    }, [open, popup, positioner, setOpen, lastReason, nested]);

    // on open, and when it moves to another trigger: the keyboard's item, else the popup with no
    // highlight (spec/menu.md, "Focus")
    // biome-ignore lint/correctness/useExhaustiveDependencies: a new active trigger focuses again
    useEffect(() => {
        if (!open || popup === null) {
            return;
        }
        const items = menuItems(popup);
        const highlight = pendingHighlight.current;
        pendingHighlight.current = null;
        const target =
            highlight === "first"
                ? items[0]
                : highlight === "last"
                  ? items.at(-1)
                  : undefined;
        (target ?? popup).focus({ preventScroll: true });
    }, [open, popup, trigger, pendingHighlight]);

    // spec/menu.md, "Modal": the root level locks the scroll and blocks the outside pointer while
    // open; on its own, so toggling `modal` while open keeps the session (and the focus) as it is
    useEffect(() => {
        if (!open || popup === null || !modal) {
            return undefined;
        }
        const doc = popup.ownerDocument;
        const unlock = lockScroll(doc);
        const unblock = blockOutsidePointer(doc);
        return () => {
            unblock();
            unlock();
        };
    }, [open, popup, modal]);

    const onKeyDown = (event: KeyboardEvent) => {
        // a submenu's keys bubble through its portal in React's tree: each level handles its own
        if (
            popup === null ||
            event.defaultPrevented ||
            !popup.contains(event.target as Node)
        ) {
            return;
        }
        const items = menuItems(popup);
        const active = popup.ownerDocument.activeElement as HTMLElement | null;
        const current = active ? items.indexOf(active) : -1;
        const focusAt = (index: number) =>
            items[index]?.focus({ preventScroll: true });
        const { close: closeKey } = submenuKeys(
            getDirection(popup, direction) === "rtl",
        );
        switch (event.key) {
            case "ArrowDown":
            case "ArrowUp":
            case "Home":
            case "End": {
                event.preventDefault();
                const target = menuKeyTarget(event.key, current, items.length, {
                    loop: context.loopFocus,
                });
                if (target !== null) {
                    focusAt(target);
                }
                return;
            }
            case "Enter":
            case " ":
                if (active && current !== -1) {
                    event.preventDefault();
                    active.click();
                }
                return;
            case "Tab": {
                event.preventDefault();
                const root = rootOf(context);
                const skip = positioners(context);
                const target = root.trigger
                    ? event.shiftKey
                        ? previousTabbableBefore(root.trigger, skip)
                        : nextTabbableAfter(root.trigger, skip)
                    : null;
                context.closeAll("focus-out", event.nativeEvent);
                target?.focus();
                return;
            }
            default:
                if (nested && event.key === closeKey) {
                    event.preventDefault();
                    setOpen(false, "list-navigation", event.nativeEvent);
                    return;
                }
                if (
                    event.key.length === 1 &&
                    !event.ctrlKey &&
                    !event.metaKey &&
                    !event.altKey
                ) {
                    const labels = items.map(
                        (item) =>
                            context.labels.get(item) ?? item.textContent ?? "",
                    );
                    const index = context.typeahead.match(
                        event.key,
                        labels,
                        current,
                    );
                    if (index !== -1) {
                        event.preventDefault();
                        focusAt(index);
                    }
                }
        }
    };

    const status = context.presence.status;
    return renderElement(
        "div",
        props,
        { open, ...context.placed },
        {
            id: context.popupId,
            role: "menu",
            // the active trigger names the menu (a submenu's: its SubmenuTrigger)
            "aria-labelledby": context.activeTriggerId ?? context.triggerId,
            "aria-orientation": "vertical",
            tabIndex: -1,
            "data-primitives-part": "menu-popup",
            ...stateAttributes({
                open,
                closed: !open,
                side: context.placed.side,
                align: context.placed.align,
                nested,
                "starting-style": status === "starting",
                "ending-style": status === "ending",
            }),
            onKeyDown,
        },
        context.setPopup,
    );
}
