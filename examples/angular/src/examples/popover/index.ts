import { Component } from "@angular/core";
import {
    PopoverArrow,
    PopoverClose,
    PopoverDescription,
    PopoverPopup,
    PopoverPortal,
    PopoverPositioner,
    PopoverRoot,
    PopoverTitle,
    PopoverTrigger,
} from "@fragiola/primitives-angular/popover";
import { styles } from "./styles.ts";

// A "Notifications" popover: the trigger opens it under itself, focus moves to its first button,
// Tab walks it and leaves it closed, and Escape or a press outside closes it.
@Component({
    selector: "example-notifications",
    imports: [
        PopoverRoot,
        PopoverTrigger,
        PopoverPortal,
        PopoverPositioner,
        PopoverPopup,
        PopoverArrow,
        PopoverTitle,
        PopoverDescription,
        PopoverClose,
    ],
    template: `
        <ng-container popoverRoot>
            <button popoverTrigger [class]="styles.trigger">Notifications</button>
            <ng-container *popoverPortal>
                <div popoverPositioner [sideOffset]="8" [class]="styles.positioner">
                    <div popoverPopup [class]="styles.popup">
                        <div popoverArrow [class]="styles.arrow"></div>
                        <h2 popoverTitle [class]="styles.title">Notifications</h2>
                        <p popoverDescription [class]="styles.description">
                            You have 2 unread messages.
                        </p>
                        <div [class]="styles.actions">
                            <button popoverClose [class]="styles.close">Dismiss</button>
                            <button popoverClose [class]="styles.close">Mark all as read</button>
                        </div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
    `,
})
export default class Notifications {
    protected readonly styles = styles;
}
