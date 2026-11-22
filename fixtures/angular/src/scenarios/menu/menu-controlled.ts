import { Component, signal, ViewEncapsulation } from "@angular/core";
import { menu } from "examples-shared/recipes/menu";
import { Output } from "../../kit/output.ts";
import { MENU_PARTS } from "./menu-parts.ts";

/** spec/menu.md, `/menu/controlled`: the page also opens it through `open`. */
@Component({
    selector: "[scenario-menu-controlled]",
    encapsulation: ViewEncapsulation.None,
    imports: [MENU_PARTS, Output],
    template: `
        <ng-container menuRoot [(open)]="open">
            <button menuTrigger [class]="styles.trigger">Actions</button>
            <ng-container *menuPortal>
                <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                    <div menuPopup [class]="styles.popup">
                        <div menuItem [class]="styles.item">Edit</div>
                        <div menuItem [class]="styles.item">Delete</div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <button type="button" class="ms-2" (click)="open.set(true)">Open from outside</button>
        <pre fixtureOutput [values]="{ open: open() }"></pre>
    `,
})
export class MenuControlled {
    protected readonly styles = menu;
    protected readonly open = signal(false);
}
