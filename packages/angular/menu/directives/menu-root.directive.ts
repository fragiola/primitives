import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    HostAttributeToken,
    inject,
    input,
    output,
} from "@angular/core";
import { createTypeahead } from "@fragiola/primitives/collection";
import {
    attachHandle,
    createOverlayRoot,
    type OpenChangeEvent,
    type OverlayActions,
    placementSignal,
} from "@fragiola/primitives-angular/internal";
import type { MenuHandle } from "../utils/menu-handle.ts";

/** Where the pointer left an open submenu's trigger, for the safe hover area (spec/menu.md). */
export interface SafeArea {
    x: number;
    y: number;
    submenu: HTMLElement;
}

export interface MenuState {
    open: boolean;
    nested: boolean;
}

/**
 * Holds the state of one menu level (spec/menu.md): `<ng-container menuRoot [(open)]="open">`,
 * or `<ng-container menuSubmenuRoot>` for a nested level, whose trigger is a `menuSubmenuTrigger`
 * item of the parent menu. One directive for both: the attribute tells them apart. Its `payload()`
 * is the active trigger's payload (`#menu="menuRoot"`); `close()` and `unmount()` are its actions.
 */
@Directive({
    selector: "[menuRoot], [menuSubmenuRoot]",
    exportAs: "menuRoot",
})
export class MenuRoot<Payload = unknown> implements OverlayActions {
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    /** Arrow keys wrap at the ends (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });
    /**
     * Locks the page's scroll and blocks the pointer outside the menu while it is open (default
     * `false`: the APG menu button is non-modal; spec/menu.md, "Modal"). A submenu follows its
     * root menu's.
     */
    readonly modal = input(false, { transform: booleanAttribute });
    /** Every requested change with its details, before it happens (`details.cancel()` keeps it). */
    readonly openChangeDetails = output<OpenChangeEvent>();
    /** An opening's or a closing's transition has finished (spec/README.md, "Lifecycle"). */
    readonly openChangeComplete = output<boolean>();
    /**
     * Connects `[menuTrigger]`s rendered outside the Root (spec/menu.md, "Detached triggers"); a
     * root menu's only.
     */
    readonly handle = input<MenuHandle<Payload> | undefined>(undefined);
    /** The id of the active trigger, controlled together with `open` (a root menu's). */
    readonly triggerId = input<string | null | undefined>(undefined);
    readonly defaultTriggerId = input<string | null>(null);

    readonly nested =
        inject(new HostAttributeToken("menuSubmenuRoot"), {
            optional: true,
        }) !== null;
    /** The menu this one is a submenu of. */
    readonly parent: MenuRoot<unknown> | null = this.nested
        ? inject<MenuRoot>(MenuRoot, { skipSelf: true, optional: true })
        : null;
    readonly overlay = createOverlayRoot(
        this,
        (event) => this.openChangeDetails.emit(event),
        "primitives-menu",
    );
    /** The active trigger's payload. */
    readonly payload = computed(
        () => this.overlay.payload() as Payload | undefined,
    );
    readonly placed = placementSignal(
        this.nested
            ? { side: "inline-end", align: "start" }
            : { side: "bottom", align: "start" },
    );
    /** The item to highlight when the popup opens: from the keyboard, the first or the last. */
    pendingHighlight: "first" | "last" | null = null;
    readonly typeahead = createTypeahead();
    /** Labels given with the `label` input, by item element. */
    readonly labels = new Map<Element, string>();
    /** The open submenu of this level, so hovering a sibling item can close it. */
    openSubmenu: MenuRoot<unknown> | null = null;
    safeArea: SafeArea | null = null;
    readonly state = computed<MenuState>(() => ({
        open: this.overlay.open(),
        nested: this.nested,
    }));

    constructor() {
        if (this.nested && this.parent === null) {
            throw new Error("[menuSubmenuRoot] must be inside a [menuRoot].");
        }
        attachHandle(this.handle, this);
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

    /** Whether the root menu is modal (a submenu follows its root). */
    readonly isModal = computed((): boolean =>
        this.parent ? this.parent.isModal() : this.modal(),
    );

    /** The root level of this menu. */
    root(): MenuRoot<unknown> {
        return this.parent ? this.parent.root() : this;
    }

    /** Every positioner of the chain of open levels, for Tab to skip. */
    positioners(): (HTMLElement | null)[] {
        const own = this.overlay.positioner();
        return this.parent ? [...this.parent.positioners(), own] : [own];
    }
}
