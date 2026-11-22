import { booleanAttribute, Directive, input } from "@angular/core";
import { DialogTriggerBase } from "@fragiola/primitives-angular/dialog";
import type { AlertDialogHandle } from "../utils/alert-dialog-handle.ts";

/**
 * Opens and closes the alert dialog (reason `trigger-press`), Dialog's Trigger:
 * `<button alertDialogTrigger>` inside the `[alertDialogRoot]`, or anywhere with a handle
 * (`[handle]`, `[payload]`, `id`; spec/alert-dialog.md, "Detached triggers").
 */
@Directive({ selector: "[alertDialogTrigger]", exportAs: "alertDialogTrigger" })
export class AlertDialogTrigger<Payload = unknown> extends DialogTriggerBase<
    Payload,
    AlertDialogHandle<Payload>
> {
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The handle of an `[alertDialogRoot]` this trigger opens from anywhere. */
    readonly handle = input<AlertDialogHandle<Payload> | undefined>(undefined);
    /** What the root's `payload()` gives while this trigger is the active one. */
    readonly payload = input<Payload | undefined>(undefined);
    /** The trigger's id (generated when not given). */
    readonly id = input<string | undefined>(undefined);
}
