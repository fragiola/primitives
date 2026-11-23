import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
} from "@angular/core";
import {
    type ChangeReason,
    dataValues,
    injectRovingItem,
    overlayTrigger,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import type { MenuBar } from "../utils/menu-bar.ts";
import type { MenuHandle } from "../utils/menu-handle.ts";
import { MenuRootBase } from "./menu-root-base.ts";

export interface MenuTriggerState {
    open: boolean;
    disabled: boolean;
}

/**
 * Opens the root menu (spec/menu.md, "Keyboard": on the Trigger): `<button menuTrigger>`, or
 * anywhere with a handle (`[handle]`, `[payload]`, `id`). In a `[menubar]`, an item of the bar
 * that hands its keys, press and hover to it (spec/menu.md, "In a Menubar").
 */
@Directive({
    selector: "[menuTrigger]",
    exportAs: "menuTrigger",
    host: {
        type: "button",
        "aria-haspopup": "menu",
        "data-primitives-part": "menu-trigger",
        "[attr.id]": "trigger.id()",
        // in a bar, focusable while disabled: its role, tabindex and aria-disabled are written
        // only there (the constructor), so outside a bar a consumer's bindings are the only ones
        "[attr.disabled]": "bar ? null : data().disabled",
        "[attr.aria-expanded]": "String(state().open)",
        "[attr.aria-controls]":
            "state().open ? (trigger.root()?.overlay?.popupId ?? null) : null",
        "[attr.data-popup-open]": "data().open",
        // a modal menu blocks the pointer outside; its triggers still toggle (spec/menu.md)
        "[style.pointer-events]": "modalOpen() ? 'auto' : null",
        "[attr.data-disabled]": "data().disabled",
        "(click)": "onClick($event)",
        "(keydown)": "onKeyDown($event)",
        "(keyup)": "onKeyUp($event)",
        "(pointerenter)": "onPointerEnter($event)",
    },
})
export class MenuTrigger<Payload = unknown> {
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The handle of a `[menuRoot]` this trigger opens from anywhere. */
    readonly handle = input<MenuHandle<Payload> | undefined>(undefined);
    /** What the root's `payload()` gives while this trigger is the active one. */
    readonly payload = input<Payload | undefined>(undefined);
    /** The trigger's id (generated when not given). */
    readonly id = input<string | undefined>(undefined);
    private readonly enclosing = inject(MenuRootBase, { optional: true });
    protected readonly trigger = overlayTrigger(this.enclosing, this, {
        prefix: "primitives-menu",
        selector: "menuTrigger",
    });
    /** The bar this Trigger is an item of: its root menu's (spec/menu.md, "In a Menubar"). */
    protected readonly bar: MenuBar | null =
        this.enclosing?.parent === null ? this.enclosing.bar : null;
    private readonly isDisabled = computed(
        () => this.disabled() || (this.bar?.disabled() ?? false),
    );
    protected readonly item = injectRovingItem(
        () => true,
        this.bar?.scope ?? null,
    );
    readonly state = computed<MenuTriggerState>(() => ({
        open: this.trigger.active(),
        disabled: this.isDisabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly modalOpen = computed(() => {
        const level = this.trigger.root();
        return level?.isModal() === true && level.overlay.open();
    });
    protected readonly String = String;

    constructor() {
        const bar = this.bar;
        const menu = this.enclosing;
        if (bar === null || menu === null) {
            return;
        }
        const host = this.trigger.host;
        // a menuitem with the bar's roving tabindex, focusable while disabled (spec/menu.md, "In
        // a Menubar"); also on a server, so the server's output keeps them
        const item = this.item;
        effect(() => {
            writeAttributes(host, {
                role: "menuitem",
                tabindex: item?.tabIndex() ?? null,
                "aria-disabled": this.isDisabled() ? "true" : null,
            });
        });
        // registered once rendered, as its roving item (never on a server)
        let unregister: (() => void) | null = null;
        afterNextRender(() => {
            unregister = bar.register(host, {
                menu,
                disabled: this.isDisabled,
            });
        });
        // while disabled, the consumer's click handler does not run (at the target, a capturing
        // listener runs before the template's)
        const guard = (event: Event) => {
            if (this.isDisabled()) {
                event.stopImmediatePropagation();
            }
        };
        host.addEventListener("click", guard, { capture: true });
        inject(DestroyRef).onDestroy(() => {
            unregister?.();
            host.removeEventListener("click", guard, { capture: true });
        });
    }

    protected onClick(event: MouseEvent): void {
        if (this.bar !== null) {
            this.bar.press(this.trigger.host, event);
            return;
        }
        const level = this.trigger.root();
        if (level === null) {
            return;
        }
        level.pendingHighlight = null;
        level.overlay.setOpen(
            !this.state().open,
            "trigger-press",
            event,
            this.trigger.host,
        );
    }

    protected onKeyDown(event: KeyboardEvent): void {
        // in a bar, its keys reach the bar's element
        if (this.bar !== null) {
            return;
        }
        const openWith = (
            highlight: "first" | "last",
            reason: ChangeReason,
        ) => {
            const level = this.trigger.root();
            // already open from this trigger: nothing to open, and no highlight left for a later
            // open
            if (level === null || this.state().open) {
                return;
            }
            level.pendingHighlight = highlight;
            if (
                !level.overlay.setOpen(true, reason, event, this.trigger.host)
            ) {
                level.pendingHighlight = null;
            }
        };
        if (event.key === "ArrowDown") {
            event.preventDefault();
            openWith("first", "list-navigation");
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            openWith("last", "list-navigation");
        } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openWith("first", "trigger-press");
        }
    }

    protected onPointerEnter(event: PointerEvent): void {
        this.bar?.hover(this.trigger.host, event);
    }

    protected onKeyUp(event: KeyboardEvent): void {
        if (event.key === " ") {
            event.preventDefault();
        }
    }
}
