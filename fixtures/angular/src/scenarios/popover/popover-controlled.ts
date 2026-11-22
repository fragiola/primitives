import { Component, signal, ViewEncapsulation } from "@angular/core";
import { popover } from "examples-shared/recipes/popover";
import { Output } from "../../kit/output.ts";
import { POPOVER_PARTS } from "./popover-parts.ts";

/** spec/popover.md, `/popover/controlled`: the page opens and closes it through `open`. */
@Component({
    selector: "[scenario-popover-controlled]",
    encapsulation: ViewEncapsulation.None,
    imports: [POPOVER_PARTS, Output],
    template: `
        <button type="button" class="me-2" (click)="open.set(true)">Show settings</button>
        <ng-container popoverRoot [(open)]="open">
            <button popoverTrigger [class]="styles.trigger">Settings</button>
            <ng-container *popoverPortal>
                <div popoverPositioner [sideOffset]="4" [class]="styles.positioner">
                    <div popoverPopup [class]="styles.popup">
                        <h2 popoverTitle [class]="styles.title">Quick settings</h2>
                        <button type="button" (click)="open.set(false)">Done</button>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ open: open() }"></pre>
    `,
})
export class PopoverControlled {
    protected readonly styles = popover;
    protected readonly open = signal(false);
}
