import { booleanAttribute, Directive, input } from "@angular/core";
import type { DialogHandle } from "../utils/dialog-handle.ts";
import { DialogTriggerBase } from "./dialog-trigger-base.ts";

/**
 * Opens and closes the dialog (reason `trigger-press`): `<button dialogTrigger>` inside the
 * `[dialogRoot]`, or anywhere with a handle (`<button dialogTrigger [handle]="handle"
 * [payload]="row" id="edit-ada">`, spec/dialog.md, "Detached triggers").
 */
@Directive({ selector: "[dialogTrigger]", exportAs: "dialogTrigger" })
export class DialogTrigger<Payload = unknown> extends DialogTriggerBase<
    Payload,
    DialogHandle<Payload>
> {
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The handle of a `[dialogRoot]` this trigger opens from anywhere. */
    readonly handle = input<DialogHandle<Payload> | undefined>(undefined);
    /** What the root's `payload()` gives while this trigger is the active one. */
    readonly payload = input<Payload | undefined>(undefined);
    /** The trigger's id (generated when not given). */
    readonly id = input<string | undefined>(undefined);
}
