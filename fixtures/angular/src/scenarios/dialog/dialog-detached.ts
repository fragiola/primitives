import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    createDialogHandle,
    type OpenChangeEvent,
} from "@fragiola/primitives-angular/dialog";
import { dialog } from "examples-shared/recipes/dialog";
import { Output } from "../../kit/output.ts";
import { DIALOG_PARTS } from "./dialog-parts.ts";

/** One Dialog opened from three rows, each trigger with the row's name as its payload. */
@Component({
    selector: "[scenario-dialog-detached]",
    encapsulation: ViewEncapsulation.None,
    imports: [DIALOG_PARTS, Output],
    template: `
        <ul class="flex flex-col gap-2">
            @for (name of people; track name) {
                <li class="flex items-center gap-2">
                    <span class="w-16">{{ name }}</span>
                    <button dialogTrigger [handle]="handle" [payload]="name" [id]="'edit-' + name.toLowerCase()" [class]="styles.trigger">{{ "Edit " + name }}</button>
                </li>
            }
        </ul>
        <button type="button" class="mt-2" (click)="handle.open('edit-grace')">Open for Grace</button>
        <ng-container dialogRoot #root="dialogRoot" [handle]="handle" (openChangeDetails)="onOpenChange($event)">
            <ng-container *dialogPortal>
                <div dialogBackdrop [class]="styles.backdrop"></div>
                <div dialogPopup [class]="styles.popup">
                    <h2 dialogTitle [class]="styles.title">{{ "Edit " + root.payload() }}</h2>
                    <button dialogClose [class]="styles.close">Close</button>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ open: open(), reason: reason(), trigger: trigger() }"></pre>
    `,
})
export class DialogDetached {
    protected readonly styles = dialog;
    protected readonly people = ["Ada", "Grace", "Alan"];
    protected readonly handle = createDialogHandle<string>();
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly trigger = signal<string | undefined>(undefined);

    protected onOpenChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
        this.reason.set(event.details.reason);
        this.trigger.set(event.details.trigger?.id);
    }
}
