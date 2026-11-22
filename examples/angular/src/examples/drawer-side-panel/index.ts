import { Component, signal } from "@angular/core";
import {
    DrawerBackdrop,
    DrawerClose,
    DrawerDescription,
    DrawerPopup,
    DrawerPortal,
    DrawerRoot,
    DrawerTitle,
    DrawerTrigger,
} from "@fragiola/primitives-angular/drawer";
import { styles } from "./styles.ts";

// A cart in a side panel at the right edge: swipe it to the right, press Escape or "Continue
// shopping" to close it; "Remove" takes an item out (spec/drawer.md).
@Component({
    selector: "example-cart-panel",
    imports: [
        DrawerRoot,
        DrawerTrigger,
        DrawerPortal,
        DrawerBackdrop,
        DrawerPopup,
        DrawerTitle,
        DrawerDescription,
        DrawerClose,
    ],
    template: `
        <div [class]="styles.stack">
            <ng-container drawerRoot swipeDirection="right">
                <button drawerTrigger [class]="styles.trigger">{{ "Cart (" + items().length + ")" }}</button>
                <ng-container *drawerPortal>
                    <div drawerBackdrop [class]="styles.backdrop"></div>
                    <div drawerPopup [class]="styles.popup">
                        <h2 drawerTitle [class]="styles.title">Your cart</h2>
                        <p drawerDescription [class]="styles.description">{{ items().length + " items, ready to check out." }}</p>
                        <ul [class]="styles.items">
                            @for (item of items(); track item) {
                                <li [class]="styles.item">{{ item }}<button type="button" [class]="styles.remove" [attr.aria-label]="'Remove ' + item" (click)="remove(item)">Remove</button></li>
                            }
                        </ul>
                        <button drawerClose [class]="styles.close">Continue shopping</button>
                    </div>
                </ng-container>
            </ng-container>
        </div>
    `,
})
export default class CartPanel {
    protected readonly styles = styles;
    protected readonly items = signal(["Notebook", "Fountain pen"]);

    protected remove(item: string): void {
        this.items.update((items) => items.filter((other) => other !== item));
    }
}
