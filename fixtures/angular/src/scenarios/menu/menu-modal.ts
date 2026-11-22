import { Component, computed, signal, ViewEncapsulation } from "@angular/core";
import { menu } from "examples-shared/recipes/menu";
import { Output } from "../../kit/output.ts";
import { MenuOutput } from "./menu-output.ts";
import { MENU_PARTS } from "./menu-parts.ts";

@Component({
    selector: "[scenario-menu-modal]",
    encapsulation: ViewEncapsulation.None,
    imports: [MENU_PARTS, Output],
    template: `
        <div class="h-[200vh]">
            <ng-container menuRoot modal [(open)]="output.open" (openChangeDetails)="output.onOpenChange($event)">
                <button menuTrigger [class]="styles.trigger">Options</button>
                <ng-container *menuPortal>
                    <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                        <div menuPopup [class]="styles.popup">
                            <div menuItem [class]="styles.item" (click)="output.select('Rename')">Rename</div>
                            <div menuItem [class]="styles.item" (click)="output.select('Remove')">Remove</div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
            <button type="button" class="ms-2" (click)="outside.set('pressed')">Outside button</button>
            <pre fixtureOutput [values]="values()"></pre>
        </div>
    `,
})
export class MenuModal {
    protected readonly styles = menu;
    protected readonly output = new MenuOutput();
    protected readonly outside = signal<string | undefined>(undefined);
    protected readonly values = computed(() => ({
        ...this.output.values(),
        outside: this.outside(),
    }));
}
