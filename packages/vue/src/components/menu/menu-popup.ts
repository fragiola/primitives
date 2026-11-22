import { menuKeyTarget, submenuKeys } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    nextTabbableAfter,
    previousTabbableBefore,
} from "@fragiola/primitives/focus";
import { blockOutsidePointer } from "@fragiola/primitives/inert";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import type { Align, Side } from "@fragiola/primitives/positioning";
import { lockScroll } from "@fragiola/primitives/scroll-lock";
import { defineComponent, ref, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type MenuContext, MenuKey } from "./menu-context.ts";
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

function rootOf(context: MenuContext): MenuContext {
    return context.parent ? rootOf(context.parent) : context;
}

function positioners(context: MenuContext): (HTMLElement | null)[] {
    const own = [context.positioner.value];
    return context.parent ? [...positioners(context.parent), ...own] : own;
}

/** One menu level: roving focus, typeahead, Escape per level (spec/menu.md). */
export interface MenuPopupState {
    open: boolean;
    side: Side;
    align: Align;
}

export const MenuPopup: PartComponent<
    Record<never, never>,
    MenuPopupState
> = publicComponent(
    defineComponent({
        name: "MenuPopup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const direction = useProvidedDirection();
            const context = useRequiredContext(MenuKey, "Menu.Popup");
            const nested = context.parent !== null;
            const setPopup = elementSetter(context.popup);
            // whether the layer is open: the opening focus waits for it, or a parent dialog's
            // focus trap (which accepts its child layers only) takes the focus back
            const layered = ref(false);

            watch(
                () =>
                    [
                        context.open.value,
                        context.popup.value,
                        context.positioner.value,
                    ] as const,
                ([open, popup, positioner], _, onCleanup) => {
                    if (!open || popup === null) {
                        return;
                    }
                    const doc = popup.ownerDocument;
                    // a context menu's area is no trigger that toggles it: a press on it is
                    // outside the menu, but it is still what the menu was opened from
                    // (spec/context-menu.md)
                    const area =
                        !nested && context.component === "context-menu";
                    // Escape, an item and the trigger give focus back to this level's trigger; the
                    // closing arrow of a submenu gives it back to its submenu trigger
                    const session = openOverlaySession(doc, {
                        elements: () => [positioner ?? popup],
                        // read when the session needs them: the active trigger may move while
                        // it is open
                        ignore: () => (area ? [] : context.triggers.value),
                        owner: () => context.triggers.value,
                        dismiss: (reason, event) =>
                            context.setOpen(false, reason, event),
                        returnFocus: {
                            when: nested
                                ? SUBMENU_RETURNS_FOCUS
                                : ROOT_RETURNS_FOCUS,
                            whenUnfocused: () =>
                                !nested && context.modal()
                                    ? MODAL_RETURNS_FOCUS_UNFOCUSED
                                    : RETURNS_FOCUS_UNFOCUSED,
                            reason: () =>
                                context.lastReason.current ??
                                (nested ? null : "none"),
                            to: () =>
                                nested
                                    ? context.trigger.value
                                    : context.returnTarget(),
                        },
                    });
                    layered.value = true;
                    onCleanup(() => {
                        session.end();
                        layered.value = false;
                    });
                },
                { flush: "post", immediate: true },
            );

            // on open, and when it moves to another trigger: the keyboard's item, else the popup
            // with no highlight (spec/menu.md, "Focus")
            watch(
                () =>
                    [
                        context.open.value,
                        context.popup.value,
                        context.trigger.value,
                        layered.value,
                    ] as const,
                ([open, popup, , isLayered]) => {
                    if (!open || popup === null || !isLayered) {
                        return;
                    }
                    const items = menuItems(popup);
                    const highlight = context.pendingHighlight.current;
                    context.pendingHighlight.current = null;
                    const target =
                        highlight === "first"
                            ? items[0]
                            : highlight === "last"
                              ? items.at(-1)
                              : undefined;
                    (target ?? popup).focus({ preventScroll: true });
                },
                { flush: "post", immediate: true },
            );

            // spec/menu.md, "Modal": the root level locks the scroll and blocks the outside pointer
            // while open; on its own, so toggling `modal` while open keeps the session as it is
            watch(
                () =>
                    [
                        context.open.value,
                        context.popup.value,
                        !nested && context.modal(),
                    ] as const,
                ([open, popup, modal], _, onCleanup) => {
                    if (!open || popup === null || !modal) {
                        return;
                    }
                    const doc = popup.ownerDocument;
                    const unlock = lockScroll(doc);
                    const unblock = blockOutsidePointer(doc);
                    onCleanup(() => {
                        unblock();
                        unlock();
                    });
                },
                { flush: "post", immediate: true },
            );

            const onKeydown = (event: KeyboardEvent) => {
                const popup = context.popup.value;
                if (popup === null || event.defaultPrevented) {
                    return;
                }
                const items = menuItems(popup);
                const active = popup.ownerDocument
                    .activeElement as HTMLElement | null;
                const current = active ? items.indexOf(active) : -1;
                const focusAt = (index: number) =>
                    items[index]?.focus({ preventScroll: true });
                const { close: closeKey } = submenuKeys(
                    getDirection(popup, direction()) === "rtl",
                );
                switch (event.key) {
                    case "ArrowDown":
                    case "ArrowUp":
                    case "Home":
                    case "End": {
                        event.preventDefault();
                        const target = menuKeyTarget(
                            event.key,
                            current,
                            items.length,
                            { loop: context.loopFocus() },
                        );
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
                        // after the trigger (a context menu: the element focused when it opened)
                        const from = root.returnTarget() ?? root.trigger.value;
                        const target = from
                            ? event.shiftKey
                                ? previousTabbableBefore(from, skip)
                                : nextTabbableAfter(from, skip)
                            : null;
                        context.closeAll("focus-out", event);
                        target?.focus();
                        return;
                    }
                    default:
                        if (nested && event.key === closeKey) {
                            event.preventDefault();
                            context.setOpen(false, "list-navigation", event);
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
                                    context.labels.get(item) ??
                                    item.textContent ??
                                    "",
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

            return () => {
                const open = context.open.value;
                const status = context.presence.status.value;
                const placed = context.placed.value;
                const contextMenu = context.component === "context-menu";
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open, ...placed },
                    {
                        id: context.popupId,
                        role: "menu",
                        // the active trigger names the menu (a submenu's: its SubmenuTrigger); no
                        // button names a context menu (spec/context-menu.md)
                        "aria-labelledby":
                            contextMenu && !nested
                                ? undefined
                                : (context.activeTriggerId.value ??
                                  context.triggerId),
                        "aria-orientation": "vertical",
                        tabindex: -1,
                        "data-primitives-part": `${context.component}-popup`,
                        ...stateAttributes({
                            open,
                            closed: !open,
                            side: placed.side,
                            align: placed.align,
                            nested,
                            "starting-style": status === "starting",
                            "ending-style": status === "ending",
                        }),
                        onKeydown,
                        // no browser menu over a context menu (spec/context-menu.md, "Pointer")
                        onContextmenu: contextMenu
                            ? (event: MouseEvent) => event.preventDefault()
                            : undefined,
                        ref: setPopup,
                    },
                );
            };
        },
    }),
);
