import {
    inDocumentOrder,
    type RovingOrientation,
    rovingKeys,
    rovingKeyTarget,
    submenuKeys,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent,
    useCallback,
    useContext,
    useMemo,
    useRef,
} from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useRovingComposite } from "../../hooks/use-roving-composite.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    MenuBarContext,
    type MenuBarContextValue,
    type MenuBarEntry,
} from "../menu/menu-bar-context.ts";
import type {
    MenuContextValue,
    PendingHighlight,
} from "../menu/menu-context.ts";
import { menuItems } from "../menu/menu-items.ts";

export interface MenubarState {
    orientation: RovingOrientation;
    disabled: boolean;
    modal: boolean;
}

export interface MenubarProps extends PartProps<MenubarState> {
    /** The arrow keys' axis, and where the menus open (default `"horizontal"`). */
    orientation?: RovingOrientation;
    /** The arrows wrap from the last item to the first and back (default `true`). */
    loopFocus?: boolean;
    /**
     * The menus lock the page's scroll and block the pointer outside while open (default `false`:
     * the APG menubar is non-modal; spec/menubar.md, "Modal").
     */
    modal?: boolean;
    /** Every item is disabled: focusable, opening nothing. */
    disabled?: boolean;
}

/** A press within this time after a hover opened a menu keeps it open (Base UI's patient click). */
const PATIENT_PRESS_MS = 500;

/** The open keys of an item: the item of its menu they focus (spec/menubar.md, "Keyboard"). */
function openKeyTarget(
    key: string,
    orientation: RovingOrientation,
    rtl: boolean,
): "first" | "last" | null {
    if (key === "Enter" || key === " ") {
        return "first";
    }
    if (orientation === "vertical") {
        return key === submenuKeys(rtl).open ? "first" : null;
    }
    return key === "ArrowDown" ? "first" : key === "ArrowUp" ? "last" : null;
}

function rootLevel(level: MenuContextValue): MenuContextValue {
    return level.parent ? rootLevel(level.parent) : level;
}

/**
 * A bar of menus with one tab stop (spec/menubar.md, the APG menubar): the `Menu.Trigger`s of the
 * `Menu.Root`s inside it are its items; it moves the focus between them and, while a menu is
 * open, from that menu to the next, by the keys and by hovering.
 */
export function Menubar({
    orientation = "horizontal",
    loopFocus = true,
    modal = false,
    disabled = false,
    ...props
}: MenubarProps) {
    const direction = useContext(DirectionContext);
    const { scope, onKeyDown: rovingKeyDown } = useRovingComposite({
        orientation,
        loopFocus,
        disabled,
    });
    const entries = useRef(
        new Map<HTMLElement, { readonly current: MenuBarEntry }>(),
    ).current;
    const hoverOpened = useRef<{ trigger: HTMLElement; time: number } | null>(
        null,
    );
    const latest = useRef({ orientation, loopFocus, direction, scope });
    latest.current = { orientation, loopFocus, direction, scope };

    const register = useCallback(
        (trigger: HTMLElement, entry: { readonly current: MenuBarEntry }) => {
            entries.set(trigger, entry);
            return () => {
                if (entries.get(trigger) === entry) {
                    entries.delete(trigger);
                }
            };
        },
        [entries],
    );
    /** The open menu of the bar and its Trigger, if any. */
    const openOne = useCallback(() => {
        for (const [trigger, entry] of entries) {
            if (entry.current.menu.open) {
                return { trigger, menu: entry.current.menu };
            }
        }
        return null;
    }, [entries]);
    /** Opens a Trigger's menu, unless it is disabled. */
    const openMenu = useCallback(
        (
            trigger: HTMLElement,
            reason: "list-navigation" | "trigger-press" | "trigger-hover",
            event: Event,
            highlight: PendingHighlight,
        ) => {
            const entry = entries.get(trigger)?.current;
            if (entry === undefined || entry.disabled) {
                return;
            }
            entry.menu.pendingHighlight.current = highlight;
            if (!entry.menu.setOpen(true, reason, event, trigger)) {
                entry.menu.pendingHighlight.current = null;
            }
        },
        [entries],
    );
    /**
     * Moves from the open menu to another item (the keys): the focus first, then the open menu
     * closes and the item's menu opens with the focus kept on it (APG).
     */
    const moveTo = useCallback(
        (target: HTMLElement, from: MenuContextValue | null, event: Event) => {
            target.focus();
            from?.setOpen(false, "list-navigation", event);
            openMenu(target, "list-navigation", event, "keep");
        },
        [openMenu],
    );

    const menuKeyDown = useCallback(
        (event: KeyboardEvent, level: MenuContextValue) => {
            if (
                event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey
            ) {
                return false;
            }
            const root = rootLevel(level);
            const trigger = root.trigger;
            if (trigger === null || !entries.has(trigger)) {
                return false;
            }
            const current = latest.current;
            const rtl =
                getDirection(level.popup ?? trigger, current.direction) ===
                "rtl";
            const nested = level.parent !== null;
            if (current.orientation === "vertical") {
                // the menu sits at the item's end side, as a submenu: its close key goes back
                if (!nested && event.key === submenuKeys(rtl).close) {
                    trigger.focus();
                    root.setOpen(false, "list-navigation", event.nativeEvent);
                    return true;
                }
                return false;
            }
            const { next, previous } = rovingKeys("horizontal", rtl);
            if (event.key !== next && !(event.key === previous && !nested)) {
                return false;
            }
            const triggers = inDocumentOrder([...entries.keys()], (t) => t);
            const index = rovingKeyTarget(
                event.key,
                triggers.indexOf(trigger),
                triggers.length,
                {
                    orientation: "horizontal",
                    rtl,
                    loop: current.loopFocus,
                },
            );
            const target = index === null ? undefined : triggers[index];
            if (target !== undefined && target !== trigger) {
                moveTo(target, root, event.nativeEvent);
            }
            return true;
        },
        [entries, moveTo],
    );

    const press = useCallback(
        (trigger: HTMLElement, event: MouseEvent<HTMLElement>) => {
            const entry = entries.get(trigger)?.current;
            if (entry === undefined || entry.disabled) {
                return;
            }
            const { menu } = entry;
            if (!menu.open) {
                openMenu(trigger, "trigger-press", event.nativeEvent, null);
                return;
            }
            const hovered = hoverOpened.current;
            hoverOpened.current = null;
            if (
                hovered?.trigger === trigger &&
                event.timeStamp - hovered.time < PATIENT_PRESS_MS
            ) {
                return;
            }
            menu.pendingHighlight.current = null;
            menu.setOpen(false, "trigger-press", event.nativeEvent, trigger);
        },
        [entries, openMenu],
    );

    const hover = useCallback(
        (trigger: HTMLElement, event: PointerEvent<HTMLElement>) => {
            const entry = entries.get(trigger)?.current;
            if (entry === undefined || entry.disabled || entry.menu.open) {
                return;
            }
            const open = openOne();
            if (open === null) {
                return;
            }
            open.menu.setOpen(false, "trigger-hover", event.nativeEvent);
            openMenu(trigger, "trigger-hover", event.nativeEvent, null);
            hoverOpened.current = { trigger, time: event.timeStamp };
            latest.current.scope.focused(trigger);
        },
        [entries, openOne, openMenu],
    );

    // the keys of the bar's items (the Triggers hand theirs to it)
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        const trigger = event.target as HTMLElement;
        const entry = entries.get(trigger)?.current;
        if (entry === undefined || event.defaultPrevented) {
            return;
        }
        const open = openOne();
        if (event.key === "Tab") {
            open?.menu.setOpen(false, "focus-out", event.nativeEvent);
            return;
        }
        rovingKeyDown(event);
        if (event.defaultPrevented) {
            const target = trigger.ownerDocument.activeElement;
            if (
                open !== null &&
                target instanceof HTMLElement &&
                target !== trigger &&
                entries.has(target)
            ) {
                open.menu.setOpen(false, "list-navigation", event.nativeEvent);
                openMenu(target, "list-navigation", event.nativeEvent, "keep");
            }
            return;
        }
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }
        const rtl = getDirection(event.currentTarget, direction) === "rtl";
        const highlight = openKeyTarget(event.key, orientation, rtl);
        if (highlight === null) {
            return;
        }
        event.preventDefault();
        if (entry.disabled) {
            return;
        }
        const { menu } = entry;
        if (menu.open) {
            // the focus is on the item of an open menu: the open keys go into it
            const items = menu.popup ? menuItems(menu.popup) : [];
            (highlight === "first" ? items[0] : items.at(-1))?.focus({
                preventScroll: true,
            });
            return;
        }
        openMenu(
            trigger,
            event.key === "Enter" || event.key === " "
                ? "trigger-press"
                : "list-navigation",
            event.nativeEvent,
            highlight,
        );
    };

    const context: MenuBarContextValue = useMemo(
        () => ({
            scope,
            orientation,
            disabled,
            modal,
            register,
            press,
            hover,
            menuKeyDown,
        }),
        [
            scope,
            orientation,
            disabled,
            modal,
            register,
            press,
            hover,
            menuKeyDown,
        ],
    );
    const state = { orientation, disabled, modal };
    return (
        <MenuBarContext.Provider value={context}>
            {renderElement("div", props, state, {
                role: "menubar",
                "aria-orientation": orientation,
                // a modal menu blocks the pointer outside; the bar takes it back (spec/menubar.md)
                style: modal ? { pointerEvents: "auto" } : undefined,
                "data-primitives-part": "menubar-root",
                ...stateAttributes({ orientation, disabled }),
                onKeyDown,
            })}
        </MenuBarContext.Provider>
    );
}
