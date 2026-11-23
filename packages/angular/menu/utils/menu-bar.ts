import { InjectionToken, type Signal } from "@angular/core";
import type { RovingOrientation } from "@fragiola/primitives/collection";
import type { RovingScope } from "@fragiola/primitives-angular/internal";
import type { MenuRootBase } from "../directives/menu-root-base.ts";

/** What a bar knows of one of its menus, registered by the menu's Trigger. */
export interface MenuBarEntry {
    /** The menu's root level. */
    readonly menu: MenuRootBase;
    /** The Trigger is disabled (its own `disabled`, or the bar's), read when the bar needs it. */
    readonly disabled: () => boolean;
}

/**
 * The contract of a parent bar (spec/menu.md, "In a Menubar"): what a `[menubar]` gives the root
 * menus whose Trigger is one of its items. Menu reads it and hands its Trigger's keys, press and
 * pointer entering, and the keys its levels leave, to the bar; every decision is the bar's
 * (`/menubar`), so `/menu` alone holds none of it.
 */
export interface MenuBar {
    /** The bar's roving-focus scope: its Triggers register with it and take its `tabindex`. */
    readonly scope: RovingScope;
    readonly orientation: Signal<RovingOrientation>;
    /** Every Trigger of the bar is disabled. */
    readonly disabled: Signal<boolean>;
    /** The bar's menus are modal (a menu of the bar follows it). */
    readonly modal: Signal<boolean>;
    /** Registers a menu by its Trigger's element; returns its unregistration. */
    register: (trigger: HTMLElement, entry: MenuBarEntry) => () => void;
    /** A press on one of the bar's Triggers. */
    press: (trigger: HTMLElement, event: MouseEvent) => void;
    /** The pointer entered one of the bar's Triggers. */
    hover: (trigger: HTMLElement, event: PointerEvent) => void;
    /**
     * A key a level of one of the bar's menus did not handle itself: `true` when the bar handled
     * it (the level then prevents its default).
     */
    menuKeyDown: (event: KeyboardEvent, level: MenuRootBase) => boolean;
}

/**
 * Provided by a `[menubar]`; a root `[menuRoot]` reads it from its parent injector and provides
 * `null` to its own content (a Menu opened from inside a bar's menu is no menu of the bar).
 */
export const MENU_BAR = new InjectionToken<MenuBar | null>("MenuBar");
