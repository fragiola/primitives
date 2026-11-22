import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
} from "@angular/core";
import {
    type ChangeReason,
    dataValues,
    overlayTrigger,
} from "@fragiola/primitives-angular/internal";
import type { MenuHandle } from "../utils/menu-handle.ts";
import { MenuRootBase } from "./menu-root-base.ts";

export interface MenuTriggerState {
    open: boolean;
    disabled: boolean;
}

/**
 * Opens the root menu (spec/menu.md, "Keyboard": on the Trigger): `<button menuTrigger>`, or
 * anywhere with a handle (`[handle]`, `[payload]`, `id`).
 */
@Directive({
    selector: "[menuTrigger]",
    exportAs: "menuTrigger",
    host: {
        type: "button",
        "aria-haspopup": "menu",
        "data-primitives-part": "menu-trigger",
        "[attr.id]": "trigger.id()",
        "[attr.disabled]": "data().disabled",
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
    protected readonly trigger = overlayTrigger(
        inject(MenuRootBase, { optional: true }),
        this,
        { prefix: "primitives-menu", selector: "menuTrigger" },
    );
    readonly state = computed<MenuTriggerState>(() => ({
        open: this.trigger.active(),
        disabled: this.disabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly modalOpen = computed(() => {
        const level = this.trigger.root();
        return level?.isModal() === true && level.overlay.open();
    });
    protected readonly String = String;

    protected onClick(event: MouseEvent): void {
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

    protected onKeyUp(event: KeyboardEvent): void {
        if (event.key === " ") {
            event.preventDefault();
        }
    }
}
