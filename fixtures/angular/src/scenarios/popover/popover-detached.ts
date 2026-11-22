import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    createPopoverHandle,
    type OpenChangeEvent,
} from "@fragiola/primitives-angular/popover";
import { popover } from "examples-shared/recipes/popover";
import { Output } from "../../kit/output.ts";
import { POPOVER_PARTS } from "./popover-parts.ts";

/** One Popover opened from two triggers, each with a name as its payload. */
@Component({
    selector: "[scenario-popover-detached]",
    encapsulation: ViewEncapsulation.None,
    imports: [POPOVER_PARTS, Output],
    template: `
        <div class="flex gap-24">
            @for (name of people; track name) {
                <button popoverTrigger [handle]="handle" [payload]="name" [id]="'info-' + name.toLowerCase()" [class]="styles.trigger">{{ "Info for " + name }}</button>
            }
        </div>
        <ng-container popoverRoot #root="popoverRoot" [handle]="handle" (openChangeDetails)="onOpenChange($event)">
            <ng-container *popoverPortal>
                <div popoverPositioner [sideOffset]="4" [class]="styles.positioner">
                    <div popoverPopup [class]="styles.popup">
                        <h2 popoverTitle [class]="styles.title">{{ "About " + root.payload() }}</h2>
                        <button popoverClose [class]="styles.close">Close</button>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ open: open(), reason: reason(), trigger: trigger() }"></pre>
    `,
})
export class PopoverDetached {
    protected readonly styles = popover;
    protected readonly people = ["Ada", "Grace"];
    protected readonly handle = createPopoverHandle<string>();
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly trigger = signal<string | undefined>(undefined);

    protected onOpenChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
        this.reason.set(event.details.reason);
        this.trigger.set(event.details.trigger?.id);
    }
}
