import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Menubar } from "@fragiola/primitives-angular/menubar";
import { menu } from "examples-shared/recipes/menu";
import { menubar } from "examples-shared/recipes/menubar";
import { Output } from "../../kit/output.ts";
import { MENU_PARTS } from "../menu/menu-parts.ts";
import { MenubarOutput } from "./menubar-output.ts";

/** spec/menubar.md, `/menubar/modal` */
@Component({
    selector: "[scenario-menubar-modal]",
    encapsulation: ViewEncapsulation.None,
    imports: [Menubar, MENU_PARTS, Output],
    template: `
        <div class="h-[200vh]">
            <div menubar aria-label="Document" [modal]="true" [class]="bar.root">
                <ng-container menuRoot (openChangeDetails)="output.onOpenChange('File', $event)">
                    <button menuTrigger [class]="bar.trigger">File</button>
                    <ng-container *menuPortal>
                        <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                            <div menuPopup [class]="styles.popup">
                                <div menuItem [class]="styles.item" (click)="output.select('Save')">Save</div>
                                <div menuItem [class]="styles.item" (click)="output.select('Close')">Close</div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
                <ng-container menuRoot (openChangeDetails)="output.onOpenChange('Edit', $event)">
                    <button menuTrigger [class]="bar.trigger">Edit</button>
                    <ng-container *menuPortal>
                        <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                            <div menuPopup [class]="styles.popup">
                                <div menuItem [class]="styles.item" (click)="output.select('Undo')">Undo</div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
            </div>
            <button type="button" class="ms-2" (click)="outside.set('pressed')">Outside button</button>
            <pre fixtureOutput [values]="{ ...output.values(), outside: outside() }"></pre>
        </div>
    `,
})
export class MenubarModal {
    protected readonly styles = menu;
    protected readonly bar = menubar;
    protected readonly output = new MenubarOutput();
    protected readonly outside = signal<string | undefined>(undefined);
}
