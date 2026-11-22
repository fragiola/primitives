import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { OpenChangeEvent } from "@fragiola/primitives-angular/menu";
import { menu } from "examples-shared/recipes/menu";
import { Output } from "../../kit/output.ts";
import { MENU_PARTS } from "./menu-parts.ts";

/** spec/menu.md: a view-options menu with checkbox and radio items. */
@Component({
    selector: "[scenario-menu-checkbox-radio]",
    encapsulation: ViewEncapsulation.None,
    imports: [MENU_PARTS, Output],
    template: `
        <ng-container menuRoot (openChangeDetails)="onOpenChange($event)">
            <button menuTrigger [class]="styles.trigger">View</button>
            <ng-container *menuPortal>
                <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                    <div menuPopup [class]="styles.popup">
                        <div menuCheckboxItem [defaultChecked]="true" [class]="styles['checkbox-item']" (checkedChange)="toolbar.set($event)"><span *menuCheckboxItemIndicator [class]="styles['checkbox-item-indicator']">✓</span>Show toolbar</div>
                        <div menuCheckboxItem [class]="styles['checkbox-item']" (checkedChange)="statusBar.set($event)"><span *menuCheckboxItemIndicator [class]="styles['checkbox-item-indicator']">✓</span>Show status bar</div>
                        <div menuSeparator [class]="styles.separator"></div>
                        <div menuGroup [class]="styles.group">
                            <div menuGroupLabel [class]="styles['group-label']">Sort by</div>
                            <div menuRadioGroup [defaultValue]="'name'" [class]="styles['radio-group']" (valueChange)="sort.set($event)">
                                <div menuRadioItem [value]="'name'" [class]="styles['radio-item']"><span *menuRadioItemIndicator [class]="styles['radio-item-indicator']">•</span>Name</div>
                                <div menuRadioItem [value]="'date'" [class]="styles['radio-item']"><span *menuRadioItemIndicator [class]="styles['radio-item-indicator']">•</span>Date</div>
                                <div menuRadioItem [value]="'size'" [disabled]="true" [class]="styles['radio-item']"><span *menuRadioItemIndicator [class]="styles['radio-item-indicator']">•</span>Size</div>
                            </div>
                        </div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ open: open(), reason: reason(), toolbar: toolbar(), 'status bar': statusBar(), sort: sort() }"></pre>
    `,
})
export class MenuCheckboxRadio {
    protected readonly styles = menu;
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly toolbar = signal(true);
    protected readonly statusBar = signal(false);
    protected readonly sort = signal<string | null>("name");

    protected onOpenChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
        this.reason.set(event.details.reason);
    }
}
