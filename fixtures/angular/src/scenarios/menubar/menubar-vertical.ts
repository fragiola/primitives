import { Component, ViewEncapsulation } from "@angular/core";
import { Menubar } from "@fragiola/primitives-angular/menubar";
import { menu } from "examples-shared/recipes/menu";
import { menubar } from "examples-shared/recipes/menubar";
import { Output } from "../../kit/output.ts";
import { MENU_PARTS } from "../menu/menu-parts.ts";
import { MenubarOutput } from "./menubar-output.ts";

/** spec/menubar.md, `/menubar/vertical` */
@Component({
    selector: "[scenario-menubar-vertical]",
    encapsulation: ViewEncapsulation.None,
    imports: [Menubar, MENU_PARTS, Output],
    template: `
        <div class="flex items-start gap-2">
            <div menubar aria-label="Tools" [orientation]="'vertical'" [loopFocus]="false" [class]="bar.root">
                <ng-container menuRoot (openChangeDetails)="output.onOpenChange('Shapes', $event)">
                    <button menuTrigger [class]="bar.trigger">Shapes</button>
                    <ng-container *menuPortal>
                        <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                            <div menuPopup [class]="styles.popup">
                                <div menuItem [class]="styles.item" (click)="output.select('Rectangle')">Rectangle</div>
                                <div menuItem [class]="styles.item" (click)="output.select('Ellipse')">Ellipse</div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
                <ng-container menuRoot (openChangeDetails)="output.onOpenChange('Arrange', $event)">
                    <button menuTrigger [class]="bar.trigger">Arrange</button>
                    <ng-container *menuPortal>
                        <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                            <div menuPopup [class]="styles.popup">
                                <div menuItem [class]="styles.item" (click)="output.select('Bring forward')">Bring forward</div>
                                <div menuItem [class]="styles.item" (click)="output.select('Send backward')">Send backward</div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
            </div>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="output.values()"></pre>
    `,
})
export class MenubarVertical {
    protected readonly styles = menu;
    protected readonly bar = menubar;
    protected readonly output = new MenubarOutput();
}
