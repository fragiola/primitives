import { Component, signal, ViewEncapsulation } from "@angular/core";
import { dialog as dialogRecipe } from "examples-shared/recipes/dialog";
import { menu as menuRecipe } from "examples-shared/recipes/menu";
import { popover as popoverRecipe } from "examples-shared/recipes/popover";
import { Output } from "../../kit/output.ts";
import { MENU_PARTS } from "../menu/menu-parts.ts";
import { POPOVER_PARTS } from "../popover/popover-parts.ts";
import { DIALOG_PARTS } from "./dialog-parts.ts";

/** A Dialog, a Popover opened from it, a Menu opened from the popover, a submenu of the menu. */
@Component({
    selector: "[scenario-dialog-nested-tree]",
    encapsulation: ViewEncapsulation.None,
    imports: [DIALOG_PARTS, POPOVER_PARTS, MENU_PARTS, Output],
    template: `
        <ng-container dialogRoot (openChange)="dialog.set($event)">
            <button dialogTrigger [class]="styles.trigger">Open settings</button>
            <ng-container *dialogPortal>
                <div dialogBackdrop [class]="styles.backdrop"></div>
                <div dialogPopup [class]="styles.popup">
                    <h2 dialogTitle [class]="styles.title">Settings</h2>
                    <ng-container popoverRoot (openChange)="popover.set($event)">
                        <button popoverTrigger [class]="popoverStyles.trigger">Theme options</button>
                        <ng-container *popoverPortal="{ keepMounted: true }">
                            <div popoverPositioner [sideOffset]="4" [class]="popoverStyles.positioner">
                                <div popoverPopup [class]="popoverStyles.popup">
                                    <h2 popoverTitle [class]="popoverStyles.title">Theme</h2>
                                    <ng-container menuRoot (openChange)="menu.set($event)">
                                        <button menuTrigger [class]="menuStyles.trigger">Pick theme</button>
                                        <ng-container *menuPortal>
                                            <div menuPositioner [sideOffset]="4" [class]="menuStyles.positioner">
                                                <div menuPopup [class]="menuStyles.popup">
                                                    <div menuItem [class]="menuStyles.item">Light</div>
                                                    <div menuItem [class]="menuStyles.item">Dark</div>
                                                    <ng-container menuSubmenuRoot (openChange)="submenu.set($event)">
                                                        <div menuSubmenuTrigger [class]="menuStyles['submenu-trigger']">More themes</div>
                                                        <ng-container *menuPortal>
                                                            <div menuPositioner [class]="menuStyles.positioner">
                                                                <div menuPopup [class]="menuStyles.popup">
                                                                    <div menuItem [class]="menuStyles.item">Solarized</div>
                                                                    <div menuItem [class]="menuStyles.item">Nord</div>
                                                                </div>
                                                            </div>
                                                        </ng-container>
                                                    </ng-container>
                                                </div>
                                            </div>
                                        </ng-container>
                                    </ng-container>
                                </div>
                            </div>
                        </ng-container>
                    </ng-container>
                    <button dialogClose [class]="styles.close">Close</button>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ dialog: dialog(), popover: popover(), menu: menu(), submenu: submenu() }"></pre>
    `,
})
export class DialogNestedTree {
    protected readonly styles = dialogRecipe;
    protected readonly popoverStyles = popoverRecipe;
    protected readonly menuStyles = menuRecipe;
    protected readonly dialog = signal(false);
    protected readonly popover = signal(false);
    protected readonly menu = signal(false);
    protected readonly submenu = signal(false);
}
