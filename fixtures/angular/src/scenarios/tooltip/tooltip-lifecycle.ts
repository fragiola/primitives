import { Component, input, ViewEncapsulation } from "@angular/core";
import { tooltip } from "examples-shared/recipes/tooltip";
import { Lifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.ts";
import { TOOLTIP_PARTS } from "./tooltip-parts.ts";

/** spec/README.md, "The lifecycle scenarios". */
@Component({
    selector: "[scenario-tooltip-lifecycle]",
    encapsulation: ViewEncapsulation.None,
    imports: [TOOLTIP_PARTS, Output],
    template: `
        <div class="mt-12">
            <ng-container tooltipRoot [delay]="0" (openChangeDetails)="lifecycle.onOpenChange($event)" (openChangeComplete)="lifecycle.onOpenChangeComplete($event)">
                <button tooltipTrigger [class]="styles.trigger">Save</button>
                <ng-container *tooltipPortal="{ keepMounted: true }">
                    <div tooltipPositioner [sideOffset]="6" [class]="styles.positioner">
                        <div tooltipPopup [class]="styles.popup">Save the document</div>
                    </div>
                </ng-container>
            </ng-container>
        </div>
        <pre fixtureOutput [values]="lifecycle.values()"></pre>
    `,
})
export class TooltipLifecycle {
    protected readonly styles = tooltip;
    readonly cancel = input(false);
    protected readonly lifecycle = new Lifecycle(() => this.cancel());
}
