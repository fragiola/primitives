import { Component, signal, ViewEncapsulation } from "@angular/core";
import { drawer } from "examples-shared/recipes/drawer";
import { Output } from "../../kit/output.ts";
import { DRAWER_PARTS } from "./drawer-parts.ts";

/** spec/drawer.md: a bottom sheet, swiped down to close, with a scrollable list. */
@Component({
    selector: "[scenario-drawer-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [DRAWER_PARTS, Output],
    template: `
        <ng-container drawerRoot (openChangeDetails)="open.set($event.open); reason.set($event.details.reason)">
            <button drawerTrigger [class]="styles.trigger">Open drawer</button>
            <ng-container *drawerPortal>
                <div drawerBackdrop [class]="styles.backdrop"></div>
                <div drawerViewport [class]="styles.viewport">
                    <div drawerPopup [class]="styles.popup">
                        <div aria-hidden="true" data-testid="drawer-handle" [class]="styles.handle"></div>
                        <div drawerContent [class]="styles.content">
                            <h2 drawerTitle [class]="styles.title">Notifications</h2>
                            <p drawerDescription [class]="styles.description">You are all caught up.</p>
                            <ul aria-label="Recent" tabindex="0" class="h-40 overflow-y-auto rounded-control border border-palette-line">
                                @for (row of rows; track row) {
                                    <li class="px-2 py-1">Notification {{ row }}</li>
                                }
                            </ul>
                            <button drawerClose [class]="styles.close">Close</button>
                        </div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <button type="button" class="ms-2">Outside button</button>
        <pre fixtureOutput [values]="{ open: open(), reason: reason() }"></pre>
    `,
})
export class DrawerBasic {
    protected readonly styles = drawer;
    protected readonly rows = Array.from(
        { length: 12 },
        (_, index) => index + 1,
    );
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
}
