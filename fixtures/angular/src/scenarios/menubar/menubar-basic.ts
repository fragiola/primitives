import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Menubar } from "@fragiola/primitives-angular/menubar";
import { menu } from "examples-shared/recipes/menu";
import { menubar } from "examples-shared/recipes/menubar";
import { Output } from "../../kit/output.ts";
import { MENU_PARTS } from "../menu/menu-parts.ts";
import { MenubarOutput } from "./menubar-output.ts";

/** spec/menubar.md, `/menubar/basic` (and `?dir=rtl`) */
@Component({
    selector: "[scenario-menubar-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [Menubar, MENU_PARTS, Output],
    template: `
        <div class="flex flex-wrap items-center gap-2">
            <button type="button">Before</button>
            <div menubar aria-label="Application" [class]="bar.root">
                <ng-container menuRoot (openChangeDetails)="output.onOpenChange('File', $event)">
                    <button menuTrigger [class]="bar.trigger">File</button>
                    <ng-container *menuPortal>
                        <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                            <div menuPopup [class]="styles.popup">
                                <div menuItem [class]="styles.item" (click)="output.select('New')">New</div>
                                <div menuItem [class]="styles.item" (click)="output.select('Open')">Open</div>
                                <ng-container menuSubmenuRoot>
                                    <div menuSubmenuTrigger [class]="styles['submenu-trigger']">Share</div>
                                    <ng-container *menuPortal>
                                        <div menuPositioner [class]="styles.positioner">
                                            <div menuPopup [class]="styles.popup">
                                                <div menuItem [class]="styles.item" (click)="output.select('Email')">Email</div>
                                                <div menuItem [class]="styles.item" (click)="output.select('Link')">Link</div>
                                            </div>
                                        </div>
                                    </ng-container>
                                </ng-container>
                                <div menuSeparator [class]="styles.separator"></div>
                                <div menuItem [class]="styles.item" (click)="output.select('Print')">Print</div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
                <ng-container menuRoot (openChangeDetails)="output.onOpenChange('Edit', $event)">
                    <button menuTrigger [class]="bar.trigger">Edit</button>
                    <ng-container *menuPortal>
                        <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                            <div menuPopup [class]="styles.popup">
                                <div menuItem [class]="styles.item" (click)="output.select('Undo')">Undo</div>
                                <div menuItem [disabled]="true" [class]="styles.item" (click)="output.select('Redo')">Redo</div>
                                <div menuItem [class]="styles.item" (click)="output.select('Cut')">Cut</div>
                                <div menuItem [class]="styles.item" (click)="output.select('Copy')">Copy</div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
                <ng-container menuRoot (openChangeDetails)="output.onOpenChange('View', $event)">
                    <button menuTrigger [class]="bar.trigger">View</button>
                    <ng-container *menuPortal>
                        <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                            <div menuPopup [class]="styles.popup">
                                <div menuCheckboxItem [defaultChecked]="true" [class]="styles['checkbox-item']" (checkedChange)="toolbar.set($event)"><span *menuCheckboxItemIndicator [class]="styles['checkbox-item-indicator']">✓</span>Show toolbar</div>
                                <div menuCheckboxItem [class]="styles['checkbox-item']" (checkedChange)="statusBar.set($event)"><span *menuCheckboxItemIndicator [class]="styles['checkbox-item-indicator']">✓</span>Show status bar</div>
                                <div menuSeparator [class]="styles.separator"></div>
                                <div menuGroup [class]="styles.group">
                                    <div menuGroupLabel [class]="styles['group-label']">Theme</div>
                                    <div menuRadioGroup [defaultValue]="'light'" [class]="styles['radio-group']" (valueChange)="theme.set($event)">
                                        <div menuRadioItem [value]="'light'" [class]="styles['radio-item']"><span *menuRadioItemIndicator [class]="styles['radio-item-indicator']">•</span>Light</div>
                                        <div menuRadioItem [value]="'dark'" [class]="styles['radio-item']"><span *menuRadioItemIndicator [class]="styles['radio-item-indicator']">•</span>Dark</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
                <ng-container menuRoot (openChangeDetails)="output.onOpenChange('Help', $event)">
                    <button menuTrigger [disabled]="true" [class]="bar.trigger">Help</button>
                    <ng-container *menuPortal>
                        <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                            <div menuPopup [class]="styles.popup">
                                <div menuItem [class]="styles.item" (click)="output.select('About')">About</div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
            </div>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ ...output.values(), toolbar: toolbar(), 'status bar': statusBar(), theme: theme() }"></pre>
    `,
})
export class MenubarBasic {
    protected readonly styles = menu;
    protected readonly bar = menubar;
    protected readonly output = new MenubarOutput();
    protected readonly toolbar = signal(true);
    protected readonly statusBar = signal(false);
    protected readonly theme = signal<string | null>("light");
}
