import { Component, signal, ViewEncapsulation } from "@angular/core";
import { drawer } from "examples-shared/recipes/drawer";
import { Output } from "../../kit/output.ts";
import { DRAWER_PARTS } from "./drawer-parts.ts";

/** spec/drawer.md, "Nested drawers": a drawer opened from inside another one. */
@Component({
    selector: "[scenario-drawer-nested]",
    encapsulation: ViewEncapsulation.None,
    imports: [DRAWER_PARTS, Output],
    template: `
        <ng-container drawerRoot (openChange)="open.set($event)">
            <button drawerTrigger [class]="styles.trigger">Open order</button>
            <ng-container *drawerPortal>
                <div drawerBackdrop [class]="styles.backdrop"></div>
                <div drawerPopup [class]="styles.popup">
                    <h2 drawerTitle [class]="styles.title">Order</h2>
                    <ng-container drawerRoot (openChange)="nested.set($event)">
                        <button drawerTrigger [class]="styles.trigger">Edit address</button>
                        <ng-container *drawerPortal>
                            <div drawerBackdrop [class]="styles.backdrop"></div>
                            <div drawerPopup [class]="styles.popup">
                                <h2 drawerTitle [class]="styles.title">Address</h2>
                                <button drawerClose [class]="styles.close">Save address</button>
                            </div>
                        </ng-container>
                    </ng-container>
                    <button drawerClose [class]="styles.close">Close order</button>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ open: open(), nested: nested() }"></pre>
    `,
})
export class DrawerNested {
    protected readonly styles = drawer;
    protected readonly open = signal(false);
    protected readonly nested = signal(false);
}
