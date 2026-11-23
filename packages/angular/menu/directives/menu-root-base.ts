import {
    computed,
    Directive,
    effect,
    HostAttributeToken,
    type InputSignal,
    type InputSignalWithTransform,
    inject,
    type OutputEmitterRef,
    signal,
    untracked,
} from "@angular/core";
import { createTypeahead } from "@fragiola/primitives/collection";
import type { VirtualAnchor } from "@fragiola/primitives/positioning";
import {
    createOverlayRoot,
    type OpenChangeEvent,
    type OverlayActions,
    placementSignal,
} from "@fragiola/primitives-angular/internal";
import { MENU_BAR, type MenuBar } from "../utils/menu-bar.ts";
import { MENU_SUBMENU } from "../utils/menu-submenu.ts";

/** Where the pointer left an open submenu's trigger, for the safe hover area (spec/menu.md). */
export interface SafeArea {
    x: number;
    y: number;
    submenu: HTMLElement;
}

/** The component a menu's parts belong to: their part attribute's prefix (spec/context-menu.md). */
export type MenuComponent = "menu" | "context-menu";

export interface MenuState {
    open: boolean;
    nested: boolean;
}

/**
 * The state of one menu level (spec/menu.md), the token every menu part injects: a Menu's
 * `[menuRoot]` / `[menuSubmenuRoot]` and a ContextMenu's roots provide it. A submenu is the one on
 * a `menuSubmenuRoot` element (or providing `MENU_SUBMENU`); its `component` is its parent's, a
 * root level's is its own (`menu`, or `context-menu`). Each root directive declares the inputs and
 * outputs.
 */
@Directive()
export abstract class MenuRootBase implements OverlayActions {
    // the inputs and outputs, declared by each root directive (its API, read where it is declared)
    abstract readonly open: InputSignal<boolean | undefined>;
    abstract readonly openChange: OutputEmitterRef<boolean>;
    abstract readonly defaultOpen: InputSignal<boolean>;
    abstract readonly loopFocus: InputSignalWithTransform<boolean, unknown>;
    abstract readonly modal: InputSignalWithTransform<boolean, unknown>;
    abstract readonly openChangeDetails: OutputEmitterRef<OpenChangeEvent>;
    abstract readonly openChangeComplete: OutputEmitterRef<boolean>;

    readonly nested =
        inject(new HostAttributeToken("menuSubmenuRoot"), {
            optional: true,
        }) !== null ||
        inject(MENU_SUBMENU, { self: true, optional: true }) === true;
    /** The menu this one is a submenu of. */
    readonly parent: MenuRootBase | null = this.nested
        ? inject(MenuRootBase, { skipSelf: true, optional: true })
        : null;
    /**
     * The bar the root menu belongs to (spec/menu.md, "In a Menubar"), at every level; or `null`.
     * A root Menu reads it from the injector around it (its own element provides `null` to its
     * content); a ContextMenu belongs to no bar.
     */
    readonly bar: MenuBar | null = this.parent
        ? this.parent.bar
        : this.component === "menu"
          ? inject(MENU_BAR, { skipSelf: true, optional: true })
          : null;
    readonly overlay = createOverlayRoot(
        this,
        (event) => this.openChangeDetails.emit(event),
        "primitives-menu",
    );
    readonly placed = placementSignal(
        // a vertical bar's menus open at its end side, as submenus (spec/menubar.md)
        this.nested || untracked(() => this.bar?.orientation()) === "vertical"
            ? { side: "inline-end", align: "start" }
            : { side: "bottom", align: "start" },
    );
    /** What the positioner anchors to instead of the trigger (a context menu's point), or `null`. */
    readonly anchor = signal<Element | VirtualAnchor | null>(null);
    /**
     * What the popup focuses when it opens (spec/menu.md, "Focus" and "In a Menubar"): from the
     * keyboard, the first or the last item; `keep` leaves the focus where it is (a bar moving to
     * this menu); `null` focuses the popup.
     */
    pendingHighlight: "first" | "last" | "keep" | null = null;
    readonly typeahead = createTypeahead();
    /** Labels given with the `label` input, by item element. */
    readonly labels = new Map<Element, string>();
    /** The open submenu of this level, so hovering a sibling item can close it. */
    openSubmenu: MenuRootBase | null = null;
    safeArea: SafeArea | null = null;
    readonly state = computed<MenuState>(() => ({
        open: this.overlay.open(),
        nested: this.nested,
    }));

    constructor() {
        if (this.nested && this.parent === null) {
            throw new Error("[menuSubmenuRoot] must be inside a [menuRoot].");
        }
        // a parent level knows its open submenu, so a hovered sibling can close it
        effect((onCleanup) => {
            const owner = this.parent;
            if (owner === null || !this.overlay.open()) {
                return;
            }
            owner.openSubmenu = this;
            onCleanup(() => {
                if (owner.openSubmenu === this) {
                    owner.openSubmenu = null;
                }
            });
        });
    }

    /** The part attributes' prefix: a submenu's is its parent's. */
    get component(): MenuComponent {
        return this.parent?.component ?? "menu";
    }

    /** The part attribute value of one of its parts (`menu-item`, `context-menu-item`). */
    part(name: string): string {
        return `${this.component}-${name}`;
    }

    /** Where focus returns on close, and where Tab moves on from: the trigger, for a Menu. */
    returnTarget(): HTMLElement | null {
        return untracked(this.overlay.trigger);
    }

    /** Closes this level and every level above it. */
    closeAll(
        reason: "item-press" | "focus-out" | "outside-press",
        event?: Event,
    ): void {
        this.overlay.setOpen(false, reason, event);
        this.parent?.closeAll(reason, event);
    }

    /** Closes this level (reason `imperative-action`). */
    close(): void {
        this.overlay.close();
    }

    /** Ends a running exit now, or the exit held by `preventUnmountOnClose()`. */
    unmount(): void {
        this.overlay.unmount();
    }

    /** Whether the root menu is modal (a submenu follows its root, a menu of a bar the bar). */
    readonly isModal = computed((): boolean =>
        this.parent
            ? this.parent.isModal()
            : this.bar
              ? this.bar.modal()
              : this.modal(),
    );

    /** The root level of this menu. */
    root(): MenuRootBase {
        return this.parent ? this.parent.root() : this;
    }

    /** Every positioner of the chain of open levels, for Tab to skip. */
    positioners(): (HTMLElement | null)[] {
        const own = this.overlay.positioner();
        return this.parent ? [...this.parent.positioners(), own] : [own];
    }
}
