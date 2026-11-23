import type { createTypeahead } from "@fragiola/primitives/collection";
import type {
    Align,
    Side,
    VirtualAnchor,
} from "@fragiola/primitives/positioning";
import type { ComputedRef, InjectionKey, Ref, ShallowRef } from "vue";
import type { OverlayRoot } from "../../composables/use-overlay-root.ts";
import type { MenuBarContext } from "./menu-bar-context.ts";

/** Where the pointer left an open submenu's trigger, for the safe hover area (spec/menu.md). */
export interface SafeArea {
    x: number;
    y: number;
    submenu: HTMLElement;
}

/** The component a menu's parts belong to: their part attribute's prefix (spec/context-menu.md). */
export type MenuComponent = "menu" | "context-menu";

export interface MenuContext extends OverlayRoot {
    component: MenuComponent;
    /** What the positioner anchors to instead of the trigger (a context menu's point), or `null`. */
    anchor: Readonly<ShallowRef<Element | VirtualAnchor | null>>;
    /** Where focus returns on close, and where Tab moves on from: the trigger, for a Menu. */
    returnTarget: () => HTMLElement | null;
    parent: MenuContext | null;
    loopFocus: () => boolean;
    /** The root menu's `modal` (a submenu follows it; a menu of a bar follows the bar's). */
    modal: () => boolean;
    /** The bar the root menu belongs to (spec/menu.md, "In a Menubar"), at every level; or `null`. */
    bar: MenuBarContext | null;
    /**
     * The item to highlight when the popup opens: from the keyboard, the first or the last;
     * `keep` leaves the focus where it is (a bar moving to this menu); `null` focuses the popup.
     */
    pendingHighlight: { current: PendingHighlight };
    typeahead: ReturnType<typeof createTypeahead>;
    labels: Map<Element, string>;
    placed: Ref<{ side: Side; align: Align }>;
    closeAll: (
        reason: "item-press" | "focus-out" | "outside-press",
        event?: Event,
    ) => void;
    openSubmenu: { current: MenuContext | null };
    safeArea: { current: SafeArea | null };
}

/** What the popup focuses when it opens (spec/menu.md, "Focus" and "In a Menubar"). */
export type PendingHighlight = "first" | "last" | "keep" | null;

export const MenuKey: InjectionKey<MenuContext> = Symbol("Menu");

/** The state a CheckboxItem or a RadioItem gives its indicator. */
export interface MenuCheckableItemState {
    checked: boolean;
    highlighted: boolean;
    disabled: boolean;
}

export const MenuCheckboxItemKey: InjectionKey<
    ComputedRef<MenuCheckableItemState>
> = Symbol("MenuCheckboxItem");

export const MenuRadioItemKey: InjectionKey<
    ComputedRef<MenuCheckableItemState>
> = Symbol("MenuRadioItem");

/** What a RadioGroup gives its items. */
export interface MenuRadioGroupContext {
    value: ComputedRef<string | null>;
    setValue: (value: string, event: Event) => void;
    disabled: () => boolean;
}

export const MenuRadioGroupKey: InjectionKey<MenuRadioGroupContext> =
    Symbol("MenuRadioGroup");

/** The `data-checked` / `data-unchecked` pair of a checkable item and its indicator. */
export function checkedAttributes(state: MenuCheckableItemState) {
    return {
        checked: state.checked,
        unchecked: !state.checked,
        highlighted: state.highlighted,
        disabled: state.disabled,
    };
}
