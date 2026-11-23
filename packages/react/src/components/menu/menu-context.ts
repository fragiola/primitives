import type { createTypeahead } from "@fragiola/primitives/collection";
import type {
    Align,
    Side,
    VirtualAnchor,
} from "@fragiola/primitives/positioning";
import { createContext, type MutableRefObject } from "react";
import type { OverlayRoot } from "../../hooks/use-overlay-root.ts";
import type { MenuBarContextValue } from "./menu-bar-context.ts";

/** Where the pointer left an open submenu's trigger, for the safe hover area (spec/menu.md). */
export interface SafeArea {
    x: number;
    y: number;
    submenu: HTMLElement;
}

/** The component a menu's parts belong to: their part attribute's prefix (spec/context-menu.md). */
export type MenuComponent = "menu" | "context-menu";

export interface MenuContextValue extends OverlayRoot {
    component: MenuComponent;
    /** What the positioner anchors to instead of the trigger (a context menu's point), or `null`. */
    anchor: Element | VirtualAnchor | null;
    /** Where focus returns on close, and where Tab moves on from: the trigger, for a Menu. */
    returnTarget: () => HTMLElement | null;
    /** The menu this one is a submenu of. */
    parent: MenuContextValue | null;
    loopFocus: boolean;
    /** The root menu's `modal` (a submenu follows it; a menu of a bar follows the bar's). */
    modal: boolean;
    /** The bar the root menu belongs to (spec/menu.md, "In a Menubar"), at every level; or `null`. */
    bar: MenuBarContextValue | null;
    /**
     * The item to highlight when the popup opens: from the keyboard, the first or the last;
     * `keep` leaves the focus where it is (a bar moving to this menu); `null` focuses the popup.
     */
    pendingHighlight: MutableRefObject<PendingHighlight>;
    typeahead: ReturnType<typeof createTypeahead>;
    /** Labels given with the `label` prop, by item element. */
    labels: Map<Element, string>;
    placed: { side: Side; align: Align };
    setPlaced: (placed: { side: Side; align: Align }) => void;
    /** Closes this level and every level above it. */
    closeAll: (
        reason: "item-press" | "focus-out" | "outside-press",
        event?: Event,
    ) => void;
    /** The open submenu of this level, so hovering a sibling item can close it. */
    openSubmenu: MutableRefObject<MenuContextValue | null>;
    safeArea: MutableRefObject<SafeArea | null>;
}

/** What the popup focuses when it opens (spec/menu.md, "Focus" and "In a Menubar"). */
export type PendingHighlight = "first" | "last" | "keep" | null;

export const MenuContext = createContext<MenuContextValue | null>(null);

/** The state a CheckboxItem or a RadioItem gives its indicator. */
export interface MenuCheckableItemState {
    checked: boolean;
    highlighted: boolean;
    disabled: boolean;
}

export const MenuCheckboxItemContext =
    createContext<MenuCheckableItemState | null>(null);

export const MenuRadioItemContext =
    createContext<MenuCheckableItemState | null>(null);

/** What a RadioGroup gives its items. */
export interface MenuRadioGroupContextValue {
    value: string | null;
    setValue: (value: string, event: Event) => void;
    disabled: boolean;
}

export const MenuRadioGroupContext =
    createContext<MenuRadioGroupContextValue | null>(null);

/** The `data-checked` / `data-unchecked` pair of a checkable item and its indicator. */
export function checkedAttributes(state: MenuCheckableItemState) {
    return {
        checked: state.checked,
        unchecked: !state.checked,
        highlighted: state.highlighted,
        disabled: state.disabled,
    };
}
