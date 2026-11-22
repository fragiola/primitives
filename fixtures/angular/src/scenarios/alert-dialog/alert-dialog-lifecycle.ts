import { Component, input, ViewEncapsulation } from "@angular/core";
import { alertDialog } from "examples-shared/recipes/alert-dialog";
import { Lifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.ts";
import { ALERT_DIALOG_PARTS } from "./alert-dialog-parts.ts";

/** spec/README.md, "The lifecycle scenarios". */
@Component({
    selector: "[scenario-alert-dialog-lifecycle]",
    encapsulation: ViewEncapsulation.None,
    imports: [ALERT_DIALOG_PARTS, Output],
    template: `
        <ng-container alertDialogRoot #root="alertDialogRoot" (openChangeDetails)="lifecycle.onOpenChange($event)" (openChangeComplete)="lifecycle.onOpenChangeComplete($event)">
            <button alertDialogTrigger [class]="styles.trigger">Delete file</button>
            <ng-container *alertDialogPortal="{ keepMounted: true }">
                <div alertDialogBackdrop [class]="styles.backdrop"></div>
                <div alertDialogPopup [class]="styles.popup">
                    <h2 alertDialogTitle [class]="styles.title">Lifecycle</h2>
                    <p alertDialogDescription [class]="styles.description">Delete the file?</p>
                    <div class="flex justify-end gap-2">
                        <button type="button" (click)="root.close()">Close with actions</button>
                        <button alertDialogClose [class]="styles.close">Close</button>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="lifecycle.values()"></pre>
    `,
})
export class AlertDialogLifecycle {
    protected readonly styles = alertDialog;
    readonly cancel = input(false);
    protected readonly lifecycle = new Lifecycle(() => this.cancel());
}
