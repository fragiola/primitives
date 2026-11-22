import { Component, input, ViewEncapsulation } from "@angular/core";
import { contextMenu } from "examples-shared/recipes/context-menu";
import { Lifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.ts";
import { CONTEXT_MENU_PARTS } from "./context-menu-parts.ts";

/** spec/README.md, "The lifecycle scenarios". */
@Component({
    selector: "[scenario-context-menu-lifecycle]",
    encapsulation: ViewEncapsulation.None,
    imports: [CONTEXT_MENU_PARTS, Output],
    template: `
        <ng-container contextMenuRoot (openChangeDetails)="lifecycle.onOpenChange($event)" (openChangeComplete)="lifecycle.onOpenChangeComplete($event)">
            <div contextMenuTrigger class="h-32 w-64">Right-click here</div>
            <ng-container *contextMenuPortal="{ keepMounted: true }">
                <div contextMenuPositioner [class]="styles.positioner">
                    <div contextMenuPopup aria-label="Actions" [class]="styles.popup">
                        <div contextMenuItem [class]="styles.item">Edit</div>
                        <div contextMenuItem [class]="styles.item">Delete</div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="lifecycle.values()"></pre>
    `,
})
export class ContextMenuLifecycle {
    protected readonly styles = contextMenu;
    readonly cancel = input(false);
    protected readonly lifecycle = new Lifecycle(() => this.cancel());
}
