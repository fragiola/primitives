import {
    afterRenderEffect,
    computed,
    Directive,
    inject,
    untracked,
} from "@angular/core";
import { menuKeyTarget, submenuKeys } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    nextTabbableAfter,
    previousTabbableBefore,
} from "@fragiola/primitives/focus";
import { blockOutsidePointer } from "@fragiola/primitives/inert";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import { lockScroll } from "@fragiola/primitives/scroll-lock";
import {
    dataValues,
    injectProvidedDirection,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { menuItems } from "./menu-items.ts";
import { MenuRootBase } from "./menu-root-base.ts";

export interface MenuPopupState {
    open: boolean;
    side: string;
    align: string;
}

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

/** One menu level: roving focus, typeahead, Escape per level (spec/menu.md): `<div menuPopup>`. */
@Directive({
    selector: "[menuPopup]",
    exportAs: "menuPopup",
    host: {
        role: "menu",
        "aria-orientation": "vertical",
        tabindex: "-1",
        "[attr.data-primitives-part]": "level.part('popup')",
        "[attr.id]": "level.overlay.popupId",
        // the active trigger names the menu (a submenu's: its SubmenuTrigger); no button names a
        // context menu (spec/context-menu.md)
        "[attr.aria-labelledby]":
            "contextMenu ? null : (level.overlay.activeTriggerId() ?? level.overlay.triggerId)",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
        "[attr.data-nested]": "data().nested",
        "[attr.data-starting-style]": "data()['starting-style']",
        "[attr.data-ending-style]": "data()['ending-style']",
        "(keydown)": "onKeyDown($event)",
        // no browser menu over a context menu (spec/context-menu.md, "Pointer")
        "(contextmenu)": "onContextMenu($event)",
    },
})
export class MenuPopup {
    /** A DirectionProvider's direction, else `null` (the computed one is read). */
    private readonly direction = injectProvidedDirection();
    protected readonly level = inject(MenuRootBase);
    readonly state = computed<MenuPopupState>(() => ({
        open: this.level.overlay.open(),
        ...this.level.placed(),
    }));
    protected readonly data = computed(() => {
        const status = this.level.overlay.presence.status();
        const state = this.state();
        return dataValues({
            ...state,
            closed: !state.open,
            nested: this.level.nested,
            "starting-style": status === "starting",
            "ending-style": status === "ending",
        });
    });
    private readonly popup = registerHost(this.level.overlay.popup);
    /** A context menu's root level: opened from an area, which names nothing. */
    protected readonly contextMenu =
        !this.level.nested && this.level.component === "context-menu";

    constructor() {
        const level = this.level;
        const overlay = level.overlay;
        const popup = this.popup;
        afterRenderEffect((onCleanup) => {
            const open = overlay.open();
            const positioner = overlay.positioner();
            if (!open) {
                return;
            }
            untracked(() => {
                const doc = popup.ownerDocument;
                // Escape, an item and the trigger give focus back to this level's trigger; the
                // closing arrow of a submenu gives it back to its submenu trigger. The triggers are
                // read when the session needs them: the active trigger may move while it is open
                // a context menu's area is no trigger that toggles it: a press on it is outside the
                // menu, but it is still what the menu was opened from (spec/context-menu.md)
                const area = this.contextMenu;
                const session = openOverlaySession(doc, {
                    elements: () => [positioner ?? popup],
                    ignore: () => (area ? [] : untracked(overlay.triggers)),
                    owner: () => untracked(overlay.triggers),
                    dismiss: (reason, event) =>
                        overlay.setOpen(false, reason, event),
                    returnFocus: {
                        when: level.nested
                            ? SUBMENU_RETURNS_FOCUS
                            : ROOT_RETURNS_FOCUS,
                        whenUnfocused: () =>
                            !level.nested && untracked(level.isModal)
                                ? MODAL_RETURNS_FOCUS_UNFOCUSED
                                : RETURNS_FOCUS_UNFOCUSED,
                        reason: () =>
                            overlay.lastReason.current ??
                            (level.nested ? null : "none"),
                        to: () =>
                            level.nested
                                ? untracked(overlay.trigger)
                                : level.returnTarget(),
                    },
                });
                onCleanup(() => session.end());
            });
        });
        // on open, and when it moves to another trigger: the keyboard's item, else the popup with
        // no highlight (spec/menu.md, "Focus")
        afterRenderEffect(() => {
            const open = overlay.open();
            overlay.trigger();
            if (!open) {
                return;
            }
            untracked(() => {
                const items = menuItems(popup);
                const highlight = level.pendingHighlight;
                level.pendingHighlight = null;
                // a bar moving to this menu keeps the focus on its item (spec/menu.md, "In a
                // Menubar")
                if (highlight === "keep") {
                    return;
                }
                const target =
                    highlight === "first"
                        ? items[0]
                        : highlight === "last"
                          ? items.at(-1)
                          : undefined;
                (target ?? popup).focus({ preventScroll: true });
            });
        });
        // spec/menu.md, "Modal": the root level locks the scroll and blocks the outside pointer
        // while open; on its own, so toggling `modal` while open keeps the session as it is
        afterRenderEffect((onCleanup) => {
            if (!overlay.open() || level.nested || !level.isModal()) {
                return;
            }
            const doc = popup.ownerDocument;
            const unlock = lockScroll(doc);
            const unblock = blockOutsidePointer(doc);
            onCleanup(() => {
                unblock();
                unlock();
            });
        });
    }

    protected onContextMenu(event: MouseEvent): void {
        if (this.level.component === "context-menu") {
            event.preventDefault();
        }
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.defaultPrevented) {
            return;
        }
        const level = this.level;
        const popup = this.popup;
        const items = menuItems(popup);
        const active = popup.ownerDocument.activeElement as HTMLElement | null;
        const current = active ? items.indexOf(active) : -1;
        const focusAt = (index: number) =>
            items[index]?.focus({ preventScroll: true });
        const { close: closeKey } = submenuKeys(
            getDirection(popup, this.direction()) === "rtl",
        );
        switch (event.key) {
            case "ArrowDown":
            case "ArrowUp":
            case "Home":
            case "End": {
                event.preventDefault();
                const target = menuKeyTarget(event.key, current, items.length, {
                    loop: level.loopFocus(),
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
                // after the trigger (a context menu: the element focused when it opened)
                const root = level.root();
                const from = root.returnTarget() ?? root.overlay.trigger();
                const skip = level.positioners();
                const target = from
                    ? event.shiftKey
                        ? previousTabbableBefore(from, skip)
                        : nextTabbableAfter(from, skip)
                    : null;
                level.closeAll("focus-out", event);
                target?.focus();
                return;
            }
            default:
                if (level.nested && event.key === closeKey) {
                    event.preventDefault();
                    level.overlay.setOpen(false, "list-navigation", event);
                    return;
                }
                // the keys a level leaves go to its bar first (spec/menu.md, "In a Menubar")
                if (level.bar?.menuKeyDown(event, level)) {
                    event.preventDefault();
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
                            level.labels.get(item) ?? item.textContent ?? "",
                    );
                    const index = level.typeahead.match(
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
    }
}
