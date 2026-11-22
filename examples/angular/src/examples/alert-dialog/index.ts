import { Component, signal } from "@angular/core";
import {
    AlertDialogBackdrop,
    AlertDialogClose,
    AlertDialogDescription,
    AlertDialogPopup,
    AlertDialogPortal,
    AlertDialogRoot,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@fragiola/primitives-angular/alert-dialog";
import { styles } from "./styles.ts";

// A draft with a "Discard draft" button: the alert dialog asks first, focus starts on "Keep
// editing" (the least destructive answer), a press outside does nothing, and "Discard" clears the
// draft and closes it (spec/alert-dialog.md).
@Component({
    selector: "example-discard-draft",
    imports: [
        AlertDialogRoot,
        AlertDialogTrigger,
        AlertDialogPortal,
        AlertDialogBackdrop,
        AlertDialogPopup,
        AlertDialogTitle,
        AlertDialogDescription,
        AlertDialogClose,
    ],
    template: `
        <div [class]="styles.stack">
            <label [class]="styles.field">Draft<textarea [class]="styles.textarea" [value]="draft()" (input)="edit($event)"></textarea></label>
            <ng-container alertDialogRoot [(open)]="open">
                <button alertDialogTrigger [disabled]="draft() === ''" [class]="styles.trigger">Discard draft</button>
                <ng-container *alertDialogPortal>
                    <div alertDialogBackdrop [class]="styles.backdrop"></div>
                    <div alertDialogPopup [class]="styles.popup">
                        <h2 alertDialogTitle [class]="styles.title">Discard draft?</h2>
                        <p alertDialogDescription [class]="styles.description">Your draft will be deleted. This cannot be undone.</p>
                        <div [class]="styles.actions">
                            <button alertDialogClose [class]="styles.close">Keep editing</button>
                            <button type="button" [class]="styles.action" (click)="discard()">Discard</button>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
        </div>
    `,
})
export default class DiscardDraft {
    protected readonly styles = styles;
    protected readonly open = signal(false);
    protected readonly draft = signal("Dear Ada, the engine is ready.");

    protected edit(event: Event): void {
        this.draft.set((event.target as HTMLTextAreaElement).value);
    }

    protected discard(): void {
        this.draft.set("");
        this.open.set(false);
    }
}
