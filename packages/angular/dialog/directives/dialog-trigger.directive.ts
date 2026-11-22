import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
} from "@angular/core";
import {
    dataValues,
    overlayTrigger,
} from "@fragiola/primitives-angular/internal";
import type { DialogHandle } from "../utils/dialog-handle.ts";
import { DialogRoot } from "./dialog-root.directive.ts";

export interface DialogTriggerState {
    open: boolean;
    disabled: boolean;
}

/**
 * Opens and closes the dialog (reason `trigger-press`): `<button dialogTrigger>` inside the
 * `[dialogRoot]`, or anywhere with a handle (`<button dialogTrigger [handle]="handle"
 * [payload]="row" id="edit-ada">`, spec/dialog.md, "Detached triggers").
 */
@Directive({
    selector: "[dialogTrigger]",
    exportAs: "dialogTrigger",
    host: {
        type: "button",
        "aria-haspopup": "dialog",
        "data-primitives-part": "dialog-trigger",
        "[attr.id]": "trigger.id()",
        "[attr.disabled]": "data().disabled",
        "[attr.aria-expanded]": "String(state().open)",
        "[attr.aria-controls]":
            "state().open ? (trigger.root()?.overlay?.popupId ?? null) : null",
        "[attr.data-popup-open]": "data().open",
        "[attr.data-disabled]": "data().disabled",
        "(click)": "onClick($event)",
    },
})
export class DialogTrigger<Payload = unknown> {
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The handle of a `[dialogRoot]` this trigger opens from anywhere. */
    readonly handle = input<DialogHandle<Payload> | undefined>(undefined);
    /** What the root's `payload()` gives while this trigger is the active one. */
    readonly payload = input<Payload | undefined>(undefined);
    /** The trigger's id (generated when not given). */
    readonly id = input<string | undefined>(undefined);
    protected readonly trigger = overlayTrigger(
        inject<DialogRoot<Payload>>(DialogRoot, { optional: true }),
        this,
        { prefix: "primitives-dialog", selector: "dialogTrigger" },
    );
    readonly state = computed<DialogTriggerState>(() => ({
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
}
