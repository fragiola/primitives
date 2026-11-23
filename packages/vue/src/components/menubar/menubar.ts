import {
    inDocumentOrder,
    type RovingOrientation,
    rovingKeys,
    rovingKeyTarget,
    submenuKeys,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import { defineComponent, type PropType, provide } from "vue";
import { useRovingComposite } from "../../composables/use-roving-composite.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type MenuBarContext,
    type MenuBarEntry,
    MenuBarKey,
} from "../menu/menu-bar-context.ts";
import type { MenuContext, PendingHighlight } from "../menu/menu-context.ts";
import { menuItems } from "../menu/menu-items.ts";

export interface MenubarState {
    orientation: RovingOrientation;
    disabled: boolean;
    modal: boolean;
}

export interface MenubarProps {
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

function rootLevel(level: MenuContext): MenuContext {
    return level.parent ? rootLevel(level.parent) : level;
}

const hasModifier = (event: KeyboardEvent) =>
    event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

/**
 * A bar of menus with one tab stop (spec/menubar.md, the APG menubar): the `Menu.Trigger`s of the
 * `Menu.Root`s inside it are its items; it moves the focus between them and, while a menu is
 * open, from that menu to the next, by the keys and by hovering.
 */
export const Menubar: PartComponent<MenubarProps, MenubarState> =
    publicComponent(
        defineComponent({
            name: "MenubarRoot",
            inheritAttrs: false,
            props: {
                ...asProp,
                orientation: {
                    type: String as PropType<RovingOrientation>,
                    default: "horizontal",
                },
                loopFocus: { type: Boolean, default: true },
                modal: { type: Boolean, default: false },
                disabled: { type: Boolean, default: false },
            },
            setup(props, { attrs, slots }) {
                const direction = useProvidedDirection();
                const {
                    scope,
                    onKeydown: rovingKeydown,
                    ref: rootRef,
                } = useRovingComposite({
                    orientation: () => props.orientation,
                    loopFocus: () => props.loopFocus,
                    disabled: () => props.disabled,
                });
                const entries = new Map<HTMLElement, MenuBarEntry>();
                let hoverOpened: { trigger: HTMLElement; time: number } | null =
                    null;

                const register = (
                    trigger: HTMLElement,
                    entry: MenuBarEntry,
                ) => {
                    entries.set(trigger, entry);
                    return () => {
                        if (entries.get(trigger) === entry) {
                            entries.delete(trigger);
                        }
                    };
                };
                /** The open menu of the bar and its Trigger, if any. */
                const openOne = () => {
                    for (const [trigger, entry] of entries) {
                        if (entry.menu.open.value) {
                            return { trigger, menu: entry.menu };
                        }
                    }
                    return null;
                };
                /** Opens a Trigger's menu, unless it is disabled. */
                const openMenu = (
                    trigger: HTMLElement,
                    reason:
                        | "list-navigation"
                        | "trigger-press"
                        | "trigger-hover",
                    event: Event,
                    highlight: PendingHighlight,
                ) => {
                    const entry = entries.get(trigger);
                    if (entry === undefined || entry.disabled()) {
                        return;
                    }
                    entry.menu.pendingHighlight.current = highlight;
                    if (!entry.menu.setOpen(true, reason, event, trigger)) {
                        entry.menu.pendingHighlight.current = null;
                    }
                };
                /**
                 * Moves from the open menu to another item (the keys): the focus first, then the
                 * open menu closes and the item's menu opens with the focus kept on it (APG).
                 */
                const moveTo = (
                    target: HTMLElement,
                    from: MenuContext | null,
                    event: Event,
                ) => {
                    target.focus();
                    from?.setOpen(false, "list-navigation", event);
                    openMenu(target, "list-navigation", event, "keep");
                };

                const menuKeyDown = (
                    event: KeyboardEvent,
                    level: MenuContext,
                ): boolean => {
                    if (hasModifier(event)) {
                        return false;
                    }
                    const root = rootLevel(level);
                    const trigger = root.trigger.value;
                    if (trigger === null || !entries.has(trigger)) {
                        return false;
                    }
                    const rtl =
                        getDirection(
                            level.popup.value ?? trigger,
                            direction(),
                        ) === "rtl";
                    const nested = level.parent !== null;
                    if (props.orientation === "vertical") {
                        // the menu sits at the item's end side, as a submenu: its close key goes
                        // back
                        if (!nested && event.key === submenuKeys(rtl).close) {
                            trigger.focus();
                            root.setOpen(false, "list-navigation", event);
                            return true;
                        }
                        return false;
                    }
                    const { next, previous } = rovingKeys("horizontal", rtl);
                    if (
                        event.key !== next &&
                        !(event.key === previous && !nested)
                    ) {
                        return false;
                    }
                    const triggers = inDocumentOrder(
                        [...entries.keys()],
                        (element) => element,
                    );
                    const index = rovingKeyTarget(
                        event.key,
                        triggers.indexOf(trigger),
                        triggers.length,
                        {
                            orientation: "horizontal",
                            rtl,
                            loop: props.loopFocus,
                        },
                    );
                    const target = index === null ? undefined : triggers[index];
                    if (target !== undefined && target !== trigger) {
                        moveTo(target, root, event);
                    }
                    return true;
                };

                const press = (trigger: HTMLElement, event: MouseEvent) => {
                    const entry = entries.get(trigger);
                    if (entry === undefined || entry.disabled()) {
                        return;
                    }
                    const { menu } = entry;
                    if (!menu.open.value) {
                        openMenu(trigger, "trigger-press", event, null);
                        return;
                    }
                    const hovered = hoverOpened;
                    hoverOpened = null;
                    if (
                        hovered?.trigger === trigger &&
                        event.timeStamp - hovered.time < PATIENT_PRESS_MS
                    ) {
                        return;
                    }
                    menu.pendingHighlight.current = null;
                    menu.setOpen(false, "trigger-press", event, trigger);
                };

                const hover = (trigger: HTMLElement, event: PointerEvent) => {
                    const entry = entries.get(trigger);
                    if (
                        entry === undefined ||
                        entry.disabled() ||
                        entry.menu.open.value
                    ) {
                        return;
                    }
                    const open = openOne();
                    if (open === null) {
                        return;
                    }
                    open.menu.setOpen(false, "trigger-hover", event);
                    openMenu(trigger, "trigger-hover", event, null);
                    hoverOpened = { trigger, time: event.timeStamp };
                    scope.focused(trigger);
                };

                // the keys of the bar's items (their keydown reaches the bar's element)
                const onKeydown = (event: KeyboardEvent) => {
                    const trigger = event.target as HTMLElement;
                    const entry = entries.get(trigger);
                    if (entry === undefined || event.defaultPrevented) {
                        return;
                    }
                    const open = openOne();
                    if (event.key === "Tab") {
                        open?.menu.setOpen(false, "focus-out", event);
                        return;
                    }
                    rovingKeydown(event);
                    if (event.defaultPrevented) {
                        const target = trigger.ownerDocument.activeElement;
                        if (
                            open !== null &&
                            target instanceof HTMLElement &&
                            target !== trigger &&
                            entries.has(target)
                        ) {
                            open.menu.setOpen(false, "list-navigation", event);
                            openMenu(target, "list-navigation", event, "keep");
                        }
                        return;
                    }
                    if (hasModifier(event)) {
                        return;
                    }
                    const rtl =
                        getDirection(
                            event.currentTarget as HTMLElement,
                            direction(),
                        ) === "rtl";
                    const highlight = openKeyTarget(
                        event.key,
                        props.orientation,
                        rtl,
                    );
                    if (highlight === null) {
                        return;
                    }
                    event.preventDefault();
                    if (entry.disabled()) {
                        return;
                    }
                    const { menu } = entry;
                    if (menu.open.value) {
                        // the focus is on the item of an open menu: the open keys go into it
                        const popup = menu.popup.value;
                        const items = popup ? menuItems(popup) : [];
                        (highlight === "first"
                            ? items[0]
                            : items.at(-1)
                        )?.focus({ preventScroll: true });
                        return;
                    }
                    openMenu(
                        trigger,
                        event.key === "Enter" || event.key === " "
                            ? "trigger-press"
                            : "list-navigation",
                        event,
                        highlight,
                    );
                };

                const context: MenuBarContext = {
                    scope,
                    orientation: () => props.orientation,
                    disabled: () => props.disabled,
                    modal: () => props.modal,
                    register,
                    press,
                    hover,
                    menuKeyDown,
                };
                provide(MenuBarKey, context);
                return () => {
                    const { orientation, disabled, modal } = props;
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        { orientation, disabled, modal },
                        {
                            role: "menubar",
                            "aria-orientation": orientation,
                            // a modal menu blocks the pointer outside; the bar takes it back
                            // (spec/menubar.md)
                            style: modal
                                ? { pointerEvents: "auto" }
                                : undefined,
                            "data-primitives-part": "menubar-root",
                            ...stateAttributes({ orientation, disabled }),
                            onKeydown,
                            ref: rootRef,
                        },
                    );
                };
            },
        }),
    );
