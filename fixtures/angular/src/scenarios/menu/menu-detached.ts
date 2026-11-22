import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    createMenuHandle,
    type OpenChangeEvent,
} from "@fragiola/primitives-angular/menu";
import { menu } from "examples-shared/recipes/menu";
import { Output } from "../../kit/output.ts";
import { MENU_PARTS } from "./menu-parts.ts";

/** One Menu opened from three rows, each trigger with the row's name as its payload. */
@Component({
    selector: "[scenario-menu-detached]",
    encapsulation: ViewEncapsulation.None,
    imports: [MENU_PARTS, Output],
    template: `
        <ul class="flex flex-col gap-28">
            @for (name of people; track name) {
                <li class="flex items-center gap-2">
                    <span class="w-16">{{ name }}</span>
                    <button menuTrigger [handle]="handle" [payload]="name" [id]="'actions-' + name.toLowerCase()" [class]="styles.trigger">{{ "Actions for " + name }}</button>
                </li>
            }
        </ul>
        <ng-container menuRoot #root="menuRoot" [handle]="handle" (openChangeDetails)="onOpenChange($event)">
            <ng-container *menuPortal>
                <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                    <div menuPopup [class]="styles.popup">
                        <div menuItem [class]="styles.item" (click)="chosen.set('Rename ' + root.payload())">{{ "Rename " + root.payload() }}</div>
                        <div menuItem [class]="styles.item" (click)="chosen.set('Delete ' + root.payload())">{{ "Delete " + root.payload() }}</div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ open: open(), reason: reason(), trigger: trigger(), chosen: chosen() }"></pre>
    `,
})
export class MenuDetached {
    protected readonly styles = menu;
    protected readonly people = ["Ada", "Grace", "Alan"];
    protected readonly handle = createMenuHandle<string>();
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly trigger = signal<string | undefined>(undefined);
    protected readonly chosen = signal<string | undefined>(undefined);

    protected onOpenChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
        this.reason.set(event.details.reason);
        this.trigger.set(event.details.trigger?.id);
    }
}
