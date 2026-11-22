import { Component, signal } from "@angular/core";
import {
    DrawerBackdrop,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerPopup,
    DrawerPortal,
    DrawerRoot,
    DrawerTitle,
    DrawerTrigger,
    DrawerViewport,
} from "@fragiola/primitives-angular/drawer";
import { styles } from "./styles.ts";

// A share sheet: "Share" opens a bottom sheet that slides up; swipe it down (with a mouse, from
// its handle; with a touch, from anywhere), press Escape or choose a target to close it
// (spec/drawer.md).
@Component({
    selector: "example-share-sheet",
    imports: [
        DrawerRoot,
        DrawerTrigger,
        DrawerPortal,
        DrawerBackdrop,
        DrawerViewport,
        DrawerPopup,
        DrawerContent,
        DrawerTitle,
        DrawerDescription,
        DrawerClose,
    ],
    template: `
        <div [class]="styles.stack">
            <ng-container drawerRoot [(open)]="open">
                <button drawerTrigger [class]="styles.trigger">Share</button>
                <ng-container *drawerPortal>
                    <div drawerBackdrop [class]="styles.backdrop"></div>
                    <div drawerViewport [class]="styles.viewport">
                        <div drawerPopup [class]="styles.popup">
                            <div aria-hidden="true" [class]="styles.handle"></div>
                            <div drawerContent [class]="styles.content">
                                <h2 drawerTitle [class]="styles.title">Share</h2>
                                <p drawerDescription [class]="styles.description">Send this page to someone.</p>
                                <div [class]="styles.targets">
                                    @for (target of targets; track target) {
                                        <button type="button" [class]="styles.target" (click)="share(target)">{{ target }}</button>
                                    }
                                </div>
                                <button drawerClose [class]="styles.close">Cancel</button>
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
            <p [class]="styles.status">{{ status() }}</p>
        </div>
    `,
})
export default class ShareSheet {
    protected readonly styles = styles;
    protected readonly targets = ["Copy link", "Email", "Messages"];
    protected readonly open = signal(false);
    protected readonly status = signal("Not shared yet");

    protected share(target: string): void {
        this.status.set(`Shared: ${target}`);
        this.open.set(false);
    }
}
