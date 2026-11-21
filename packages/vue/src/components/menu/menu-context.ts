import type { createTypeahead } from "@fragiola/primitives/collection";
import type { Align, Side } from "@fragiola/primitives/positioning";
import type { InjectionKey, Ref } from "vue";
import type { OverlayRoot } from "../../composables/use-overlay-root.ts";

/** Where the pointer left an open submenu's trigger, for the safe hover area (spec/menu.md). */
export interface SafeArea {
    x: number;
    y: number;
    submenu: HTMLElement;
}

export interface MenuContext extends OverlayRoot {
    parent: MenuContext | null;
    loopFocus: () => boolean;
    /** The root menu's `modal` (a submenu follows it). */
    modal: () => boolean;
    pendingHighlight: { current: "first" | "last" | null };
    typeahead: ReturnType<typeof createTypeahead>;
    labels: Map<Element, string>;
    placed: Ref<{ side: Side; align: Align }>;
    closeAll: (reason: "item-press" | "focus-out" | "outside-press") => void;
    openSubmenu: { current: MenuContext | null };
    safeArea: { current: SafeArea | null };
}

export const MenuKey: InjectionKey<MenuContext> = Symbol("Menu");
