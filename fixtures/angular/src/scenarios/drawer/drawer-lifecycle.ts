import { Component, input, ViewEncapsulation } from "@angular/core";
import { drawer } from "examples-shared/recipes/drawer";
import { Lifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.ts";
import { DRAWER_PARTS } from "./drawer-parts.ts";

/** spec/README.md, "The lifecycle scenarios". */
@Component({
    selector: "[scenario-drawer-lifecycle]",
    encapsulation: ViewEncapsulation.None,
    imports: [DRAWER_PARTS, Output],
    template: `
        <ng-container drawerRoot #root="drawerRoot" (openChangeDetails)="lifecycle.onOpenChange($event)" (openChangeComplete)="lifecycle.onOpenChangeComplete($event)">
            <button drawerTrigger [class]="styles.trigger">Open drawer</button>
            <ng-container *drawerPortal="{ keepMounted: true }">
                <div drawerBackdrop [class]="styles.backdrop"></div>
                <div drawerPopup [class]="styles.popup">
                    <h2 drawerTitle [class]="styles.title">Lifecycle</h2>
                    <div class="flex justify-end gap-2">
                        <button type="button" (click)="root.close()">Close with actions</button>
                        <button drawerClose [class]="styles.close">Close</button>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="lifecycle.values()"></pre>
    `,
})
export class DrawerLifecycle {
    protected readonly styles = drawer;
    readonly cancel = input(false);
    protected readonly lifecycle = new Lifecycle(() => this.cancel());
}
