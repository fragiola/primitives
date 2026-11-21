import { Component, ViewEncapsulation } from "@angular/core";
import { popover } from "examples-shared/recipes/popover";
import { POPOVER_PARTS } from "./popover-parts.ts";

@Component({
    selector: "[scenario-popover-initial-focus]",
    encapsulation: ViewEncapsulation.None,
    imports: [POPOVER_PARTS],
    template: `
        <ng-container popoverRoot>
            <button popoverTrigger [class]="styles.trigger">Share</button>
            <ng-container *popoverPortal>
                <div popoverPositioner [sideOffset]="4" [class]="styles.positioner">
                    <div popoverPopup [initialFocus]="copy" [class]="styles.popup">
                        <h2 popoverTitle [class]="styles.title">Share link</h2>
                        <label class="flex flex-col gap-1">Link<input type="text" class="h-9 rounded-md border border-palette-line px-2" /></label>
                        <button #copy type="button">Copy</button>
                    </div>
                </div>
            </ng-container>
        </ng-container>
    `,
})
export class PopoverInitialFocus {
    protected readonly styles = popover;
}
