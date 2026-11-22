import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    createTooltipHandle,
    type OpenChangeEvent,
} from "@fragiola/primitives-angular/tooltip";
import { tooltip } from "examples-shared/recipes/tooltip";
import { Output } from "../../kit/output.ts";
import { TOOLTIP_PARTS } from "./tooltip-parts.ts";

/** One Tooltip describing two triggers, each with a name as its payload. */
@Component({
    selector: "[scenario-tooltip-detached]",
    encapsulation: ViewEncapsulation.None,
    imports: [TOOLTIP_PARTS, Output],
    template: `
        <div class="mt-12 flex gap-8">
            @for (name of people; track name) {
                <button tooltipTrigger [handle]="handle" [payload]="name" [id]="'call-' + name.toLowerCase()" [class]="styles.trigger">{{ "Call " + name }}</button>
            }
        </div>
        <ng-container tooltipRoot #root="tooltipRoot" [handle]="handle" [delay]="300" (openChangeDetails)="onOpenChange($event)">
            <ng-container *tooltipPortal>
                <div tooltipPositioner [sideOffset]="6" [class]="styles.positioner">
                    <div tooltipPopup [class]="styles.popup">{{ "Opens a call with " + root.payload() }}</div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ open: open(), reason: reason(), trigger: trigger() }"></pre>
    `,
})
export class TooltipDetached {
    protected readonly styles = tooltip;
    protected readonly people = ["Ada", "Grace"];
    protected readonly handle = createTooltipHandle<string>();
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly trigger = signal<string | undefined>(undefined);

    protected onOpenChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
        this.reason.set(event.details.reason);
        this.trigger.set(event.details.trigger?.id);
    }
}
