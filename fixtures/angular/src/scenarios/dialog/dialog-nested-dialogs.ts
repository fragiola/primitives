import { Component, signal, ViewEncapsulation } from "@angular/core";
import { dialog } from "examples-shared/recipes/dialog";
import { Output } from "../../kit/output.ts";
import { DIALOG_PARTS } from "./dialog-parts.ts";

/** Three dialogs nested in each other, each with a Backdrop and a Viewport (spec/dialog.md). */
@Component({
    selector: "[scenario-dialog-nested-dialogs]",
    encapsulation: ViewEncapsulation.None,
    imports: [DIALOG_PARTS, Output],
    template: `
        <ng-container dialogRoot (openChange)="first.set($event)">
            <button dialogTrigger [class]="styles.trigger">Open first</button>
            <ng-container *dialogPortal>
                <div dialogBackdrop [class]="styles.backdrop"></div>
                <div dialogViewport [class]="styles.viewport">
                    <div dialogPopup [class]="styles.popup">
                        <h2 dialogTitle [class]="styles.title">First dialog</h2>
                        <ng-container dialogRoot (openChange)="second.set($event)">
                            <button dialogTrigger [class]="styles.trigger">Open second</button>
                            <ng-container *dialogPortal>
                                <div dialogBackdrop [class]="styles.backdrop"></div>
                                <div dialogViewport [class]="styles.viewport">
                                    <div dialogPopup [class]="styles.popup">
                                        <h2 dialogTitle [class]="styles.title">Second dialog</h2>
                                        <ng-container dialogRoot (openChange)="third.set($event)">
                                            <button dialogTrigger [class]="styles.trigger">Open third</button>
                                            <ng-container *dialogPortal>
                                                <div dialogBackdrop [class]="styles.backdrop"></div>
                                                <div dialogViewport [class]="styles.viewport">
                                                    <div dialogPopup [class]="styles.popup">
                                                        <h2 dialogTitle [class]="styles.title">Third dialog</h2>
                                                        <button dialogClose [class]="styles.close">Close third</button>
                                                    </div>
                                                </div>
                                            </ng-container>
                                        </ng-container>
                                        <button dialogClose [class]="styles.close">Close second</button>
                                    </div>
                                </div>
                            </ng-container>
                        </ng-container>
                        <button dialogClose [class]="styles.close">Close first</button>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ first: first(), second: second(), third: third() }"></pre>
    `,
})
export class DialogNestedDialogs {
    protected readonly styles = dialog;
    protected readonly first = signal(false);
    protected readonly second = signal(false);
    protected readonly third = signal(false);
}
