import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { SnapPoint } from "@fragiola/primitives-angular/drawer";
import { drawer } from "examples-shared/recipes/drawer";
import { Output } from "../../kit/output.ts";
import { DRAWER_PARTS } from "./drawer-parts.ts";

/** spec/drawer.md: a bottom sheet resting at 200 px or all of its 560 px. */
@Component({
    selector: "[scenario-drawer-snap-points]",
    encapsulation: ViewEncapsulation.None,
    imports: [DRAWER_PARTS, Output],
    template: `
        <ng-container drawerRoot [snapPoints]="snapPoints" [(snapPoint)]="snap" (openChangeDetails)="open.set($event.open); reason.set($event.details.reason)">
            <button drawerTrigger [class]="styles.trigger">Open map</button>
            <ng-container *drawerPortal>
                <div drawerBackdrop [class]="styles.backdrop"></div>
                <div drawerPopup [class]="styles.popup" style="height: 560px">
                    <h2 drawerTitle [class]="styles.title">Map</h2>
                    <p drawerDescription [class]="styles.description">Drag to see more.</p>
                    <button drawerClose [class]="styles.close">Close</button>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ open: open(), reason: reason(), snap: snap() }"></pre>
    `,
})
export class DrawerSnapPoints {
    protected readonly styles = drawer;
    protected readonly snapPoints: SnapPoint[] = ["200px", 1];
    protected readonly snap = signal<SnapPoint | null>("200px");
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
}
