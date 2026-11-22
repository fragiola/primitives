import { Component, signal, ViewEncapsulation } from "@angular/core";
import { alertDialog } from "examples-shared/recipes/alert-dialog";
import { Output } from "../../kit/output.ts";
import { ALERT_DIALOG_PARTS } from "./alert-dialog-parts.ts";

/** spec/alert-dialog.md: a destructive confirmation, never dismissed from outside. */
@Component({
    selector: "[scenario-alert-dialog-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [ALERT_DIALOG_PARTS, Output],
    template: `
        <ng-container alertDialogRoot #root="alertDialogRoot" (openChangeDetails)="open.set($event.open); reason.set($event.details.reason)">
            <button alertDialogTrigger [class]="styles.trigger">Discard draft</button>
            <ng-container *alertDialogPortal>
                <div alertDialogBackdrop [class]="styles.backdrop"></div>
                <div alertDialogPopup [class]="styles.popup">
                    <h2 alertDialogTitle [class]="styles.title">Discard draft?</h2>
                    <p alertDialogDescription [class]="styles.description">Your unsaved changes will be lost.</p>
                    <div class="flex justify-end gap-2">
                        <button type="button" [class]="styles.action" (click)="action.set('discard'); root.close()">Discard</button>
                        <button alertDialogClose [class]="styles.close">Cancel</button>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <button type="button" class="ms-2">Outside button</button>
        <pre fixtureOutput [values]="{ open: open(), reason: reason(), action: action() }"></pre>
    `,
})
export class AlertDialogBasic {
    protected readonly styles = alertDialog;
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly action = signal<string | undefined>(undefined);
}
