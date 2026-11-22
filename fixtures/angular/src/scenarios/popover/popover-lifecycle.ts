import { Component, input, ViewEncapsulation } from "@angular/core";
import { popover } from "examples-shared/recipes/popover";
import { Lifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.ts";
import { POPOVER_PARTS } from "./popover-parts.ts";

/** spec/README.md, "The lifecycle scenarios". */
@Component({
    selector: "[scenario-popover-lifecycle]",
    encapsulation: ViewEncapsulation.None,
    imports: [POPOVER_PARTS, Output],
    template: `
        <ng-container popoverRoot #root="popoverRoot" (openChangeDetails)="lifecycle.onOpenChange($event)" (openChangeComplete)="lifecycle.onOpenChangeComplete($event)">
            <button popoverTrigger [class]="styles.trigger">Open popover</button>
            <ng-container *popoverPortal="{ keepMounted: true }">
                <div popoverPositioner [sideOffset]="4" [class]="styles.positioner">
                    <div popoverPopup [class]="styles.popup">
                        <h2 popoverTitle [class]="styles.title">Lifecycle</h2>
                        <button type="button" (click)="root.close()">Close with actions</button>
                        <button popoverClose [class]="styles.close">Close</button>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="lifecycle.values()"></pre>
    `,
})
export class PopoverLifecycle {
    protected readonly styles = popover;
    readonly cancel = input(false);
    protected readonly lifecycle = new Lifecycle(() => this.cancel());
}
