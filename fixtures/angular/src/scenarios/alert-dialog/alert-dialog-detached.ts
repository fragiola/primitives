import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    createAlertDialogHandle,
    type OpenChangeEvent,
} from "@fragiola/primitives-angular/alert-dialog";
import { alertDialog } from "examples-shared/recipes/alert-dialog";
import { Output } from "../../kit/output.ts";
import { ALERT_DIALOG_PARTS } from "./alert-dialog-parts.ts";

/** One AlertDialog opened from two triggers, each with a name as its payload. */
@Component({
    selector: "[scenario-alert-dialog-detached]",
    encapsulation: ViewEncapsulation.None,
    imports: [ALERT_DIALOG_PARTS, Output],
    template: `
        <div class="flex gap-2">
            @for (name of people; track name) {
                <button alertDialogTrigger [handle]="handle" [payload]="name" [id]="'delete-' + name.toLowerCase()" [class]="styles.trigger">{{ "Delete " + name }}</button>
            }
        </div>
        <button type="button" class="mt-2" (click)="handle.open('delete-grace')">Delete for Grace</button>
        <ng-container alertDialogRoot #root="alertDialogRoot" [handle]="handle" (openChangeDetails)="onOpenChange($event)">
            <ng-container *alertDialogPortal>
                <div alertDialogBackdrop [class]="styles.backdrop"></div>
                <div alertDialogViewport [class]="styles.viewport">
                    <div alertDialogPopup [class]="styles.popup">
                        <h2 alertDialogTitle [class]="styles.title">{{ "Delete " + root.payload() + "?" }}</h2>
                        <p alertDialogDescription [class]="styles.description">This cannot be undone.</p>
                        <button alertDialogClose [class]="styles.close">Cancel</button>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ open: open(), reason: reason(), trigger: trigger() }"></pre>
    `,
})
export class AlertDialogDetached {
    protected readonly styles = alertDialog;
    protected readonly people = ["Ada", "Grace"];
    protected readonly handle = createAlertDialogHandle<string>();
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly trigger = signal<string | undefined>(undefined);

    protected onOpenChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
        this.reason.set(event.details.reason);
        this.trigger.set(event.details.trigger?.id);
    }
}
