import type { RovingOrientation } from "@fragiola/primitives/collection";
import type { InjectionKey } from "vue";
import type { RovingScope } from "../../utils/roving-context.ts";
import type { MenuContext } from "./menu-context.ts";

/** What a bar knows of one of its menus, kept current by the menu's Trigger. */
export interface MenuBarEntry {
    /** The menu's root level. */
    menu: MenuContext;
    /** The Trigger is disabled (its own `disabled`, or the bar's). */
    disabled: () => boolean;
}

/**
 * The contract of a parent bar (spec/menu.md, "In a Menubar"): what a Menubar gives the root
 * menus whose Trigger is one of its items. Menu reads it and hands its Trigger's press and
 * pointer entering, and the keys its levels leave, to the bar (the Trigger's own keys reach the
 * bar's element); every decision is the bar's (`/menubar`), so `/menu` alone holds none of it.
 */
export interface MenuBarContext {
    /** The bar's roving-focus scope: its Triggers register with it and take its `tabindex`. */
    scope: RovingScope;
    orientation: () => RovingOrientation;
    /** Every Trigger of the bar is disabled. */
    disabled: () => boolean;
    /** The bar's menus are modal (a menu of the bar follows it). */
    modal: () => boolean;
    /** Registers a menu by its Trigger's element; returns its unregistration. */
    register: (trigger: HTMLElement, entry: MenuBarEntry) => () => void;
    /** A press on one of the bar's Triggers. */
    press: (trigger: HTMLElement, event: MouseEvent) => void;
    /** The pointer entered one of the bar's Triggers. */
    hover: (trigger: HTMLElement, event: PointerEvent) => void;
    /**
     * A key a level of one of the bar's menus did not handle itself: `true` when the bar handled
     * it (the level then prevents its default). Offered explicitly: a Teleport does not bubble the
     * popup's keys to the bar's element.
     */
    menuKeyDown: (event: KeyboardEvent, level: MenuContext) => boolean;
}

/** Provided by a Menubar; a menu's Root reads it and hides it from the Roots inside its content. */
export const MenuBarKey: InjectionKey<MenuBarContext | null> =
    Symbol("MenuBar");
