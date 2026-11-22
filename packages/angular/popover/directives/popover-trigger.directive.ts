import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
} from "@angular/core";
import { getTabbables } from "@fragiola/primitives/focus";
import {
    dataValues,
    overlayTrigger,
} from "@fragiola/primitives-angular/internal";
import type { PopoverHandle } from "../utils/popover-handle.ts";
import { PopoverRoot } from "./popover-root.directive.ts";

export interface PopoverTriggerState {
    open: boolean;
    disabled: boolean;
}

/**
 * Toggles the popover and anchors it: `<button popoverTrigger>`, or anywhere with a handle
 * (`[handle]`, `[payload]`, `id`). While open, Tab from the active trigger enters the popup
 * (spec/popover.md).
 */
@Directive({
    selector: "[popoverTrigger]",
    exportAs: "popoverTrigger",
    host: {
        type: "button",
        "aria-haspopup": "dialog",
        "data-primitives-part": "popover-trigger",
        "[attr.id]": "trigger.id()",
        "[attr.disabled]": "data().disabled",
        "[attr.aria-expanded]": "String(state().open)",
        "[attr.aria-controls]":
            "state().open ? (trigger.root()?.overlay?.popupId ?? null) : null",
        "[attr.data-popup-open]": "data().open",
        "[attr.data-disabled]": "data().disabled",
        "(click)": "onClick($event)",
        "(keydown)": "onKeyDown($event)",
    },
})
export class PopoverTrigger<Payload = unknown> {
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The handle of a `[popoverRoot]` this trigger opens from anywhere. */
    readonly handle = input<PopoverHandle<Payload> | undefined>(undefined);
    /** What the root's `payload()` gives while this trigger is the active one. */
    readonly payload = input<Payload | undefined>(undefined);
    /** The trigger's id (generated when not given). */
    readonly id = input<string | undefined>(undefined);
    protected readonly trigger = overlayTrigger(
        inject<PopoverRoot<Payload>>(PopoverRoot, { optional: true }),
        this,
        { prefix: "primitives-popover", selector: "popoverTrigger" },
    );
    readonly state = computed<PopoverTriggerState>(() => ({
        open: this.trigger.active(),
        disabled: this.disabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly String = String;

    protected onClick(event: MouseEvent): void {
        this.trigger
            .root()
            ?.overlay.setOpen(
                !this.trigger.active(),
                "trigger-press",
                event,
                this.trigger.host,
            );
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const popup = this.trigger.root()?.overlay.popup();
        if (
            event.key === "Tab" &&
            !event.shiftKey &&
            this.state().open &&
            popup
        ) {
            event.preventDefault();
            (getTabbables(popup)[0] ?? popup).focus();
        }
    }
}
