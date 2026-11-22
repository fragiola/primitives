import { Component, input, ViewEncapsulation } from "@angular/core";
import { menu } from "examples-shared/recipes/menu";
import { Lifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.ts";
import { MENU_PARTS } from "./menu-parts.ts";

/** spec/README.md, "The lifecycle scenarios". */
@Component({
    selector: "[scenario-menu-lifecycle]",
    encapsulation: ViewEncapsulation.None,
    imports: [MENU_PARTS, Output],
    template: `
        <ng-container menuRoot (openChangeDetails)="lifecycle.onOpenChange($event)" (openChangeComplete)="lifecycle.onOpenChangeComplete($event)">
            <button menuTrigger [class]="styles.trigger">Actions</button>
            <ng-container *menuPortal="{ keepMounted: true }">
                <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                    <div menuPopup [class]="styles.popup">
                        <div menuItem [class]="styles.item">Edit</div>
                        <div menuItem [class]="styles.item">Delete</div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="lifecycle.values()"></pre>
    `,
})
export class MenuLifecycle {
    protected readonly styles = menu;
    readonly cancel = input(false);
    protected readonly lifecycle = new Lifecycle(() => this.cancel());
}
