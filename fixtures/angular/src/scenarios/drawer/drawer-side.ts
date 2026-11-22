import { Component, signal, ViewEncapsulation } from "@angular/core";
import { drawer } from "examples-shared/recipes/drawer";
import { Output } from "../../kit/output.ts";
import { DRAWER_PARTS } from "./drawer-parts.ts";

/** spec/drawer.md: a side panel at the right edge, swiped right to close. */
@Component({
    selector: "[scenario-drawer-side]",
    encapsulation: ViewEncapsulation.None,
    imports: [DRAWER_PARTS, Output],
    template: `
        <ng-container drawerRoot swipeDirection="right" (openChangeDetails)="open.set($event.open); reason.set($event.details.reason)">
            <button drawerTrigger [class]="styles.trigger">Open settings</button>
            <ng-container *drawerPortal>
                <div drawerBackdrop [class]="styles.backdrop"></div>
                <div drawerPopup [class]="styles.popup">
                    <h2 drawerTitle [class]="styles.title">Settings</h2>
                    <p drawerDescription [class]="styles.description">Choose what you see.</p>
                    <button drawerClose [class]="styles.close">Done</button>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ open: open(), reason: reason() }"></pre>
    `,
})
export class DrawerSide {
    protected readonly styles = drawer;
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
}
