import { Component } from "@angular/core";
import {
    MenuItem,
    MenuPopup,
    MenuPortal,
    MenuPositioner,
    MenuRoot,
    MenuSeparator,
    MenuSubmenuTrigger,
    MenuTrigger,
} from "@fragiola/primitives-angular/menu";
import { styles } from "./styles.ts";

// A "File" menu button: the arrow keys move through the items (a disabled one stays focusable),
// ArrowRight opens the "Share" submenu, Escape closes one level and an item closes them all.
@Component({
    selector: "example-file-menu",
    imports: [
        MenuRoot,
        MenuTrigger,
        MenuPortal,
        MenuPositioner,
        MenuPopup,
        MenuItem,
        MenuSeparator,
        MenuSubmenuTrigger,
    ],
    template: `
        <ng-container menuRoot>
            <button menuTrigger [class]="styles.trigger">File</button>
            <ng-container *menuPortal>
                <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                    <div menuPopup [class]="styles.popup">
                        <div menuItem [class]="styles.item">New file</div>
                        <div menuItem [class]="styles.item">Open…</div>
                        <ng-container menuSubmenuRoot>
                            <div menuSubmenuTrigger [class]="styles.submenuTrigger">Share</div>
                            <ng-container *menuPortal>
                                <div menuPositioner [class]="styles.positioner">
                                    <div menuPopup [class]="styles.popup">
                                        <div menuItem [class]="styles.item">Email</div>
                                        <div menuItem [class]="styles.item">Copy link</div>
                                    </div>
                                </div>
                            </ng-container>
                        </ng-container>
                        <div menuSeparator [class]="styles.separator"></div>
                        <div menuItem [disabled]="true" [class]="styles.item">Export</div>
                        <div menuItem [class]="styles.item">Rename</div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
    `,
})
export default class FileMenu {
    protected readonly styles = styles;
}
