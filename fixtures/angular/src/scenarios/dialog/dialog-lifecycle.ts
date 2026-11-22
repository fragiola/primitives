import { Component, input, ViewEncapsulation } from "@angular/core";
import { dialog } from "examples-shared/recipes/dialog";
import { Lifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.ts";
import { DIALOG_PARTS } from "./dialog-parts.ts";

/** spec/README.md, "The lifecycle scenarios". */
@Component({
    selector: "[scenario-dialog-lifecycle]",
    encapsulation: ViewEncapsulation.None,
    imports: [DIALOG_PARTS, Output],
    template: `
        <ng-container dialogRoot #root="dialogRoot" (openChangeDetails)="lifecycle.onOpenChange($event)" (openChangeComplete)="lifecycle.onOpenChangeComplete($event)">
            <button dialogTrigger [class]="styles.trigger">Open dialog</button>
            <ng-container *dialogPortal="{ keepMounted: true }">
                <div dialogBackdrop [class]="styles.backdrop"></div>
                <div dialogPopup [class]="styles.popup">
                    <h2 dialogTitle [class]="styles.title">Lifecycle</h2>
                    <div class="flex justify-end gap-2">
                        <button type="button" (click)="root.close()">Close with actions</button>
                        <button dialogClose [class]="styles.close">Close</button>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="lifecycle.values()"></pre>
    `,
})
export class DialogLifecycle {
    protected readonly styles = dialog;
    readonly cancel = input(false);
    protected readonly lifecycle = new Lifecycle(() => this.cancel());
}
