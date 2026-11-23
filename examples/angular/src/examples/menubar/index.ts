import { Component, signal } from "@angular/core";
import {
    MenuCheckboxItem,
    MenuCheckboxItemIndicator,
    MenuGroup,
    MenuGroupLabel,
    MenuItem,
    MenuPopup,
    MenuPortal,
    MenuPositioner,
    MenuRadioGroup,
    MenuRadioItem,
    MenuRadioItemIndicator,
    MenuRoot,
    MenuSeparator,
    MenuSubmenuTrigger,
    MenuTrigger,
} from "@fragiola/primitives-angular/menu";
import { Menubar } from "@fragiola/primitives-angular/menubar";
import { styles } from "./styles.ts";

const RECENT = ["notes.md", "budget.csv", "plan.txt"];

const ZOOMS = [
    { value: "75", label: "75%" },
    { value: "100", label: "100%" },
    { value: "150", label: "150%" },
];

// An app menu bar: File, Edit and View are Menus whose Triggers are the bar's items, one tab
// stop. The arrow keys move between them, ArrowDown opens a menu, and while one is open the
// arrows and the pointer move from menu to menu; "Open recent" is a submenu, and View holds
// checkbox and radio items (spec/menubar.md).
@Component({
    selector: "example-app-menubar",
    imports: [
        Menubar,
        MenuRoot,
        MenuTrigger,
        MenuPortal,
        MenuPositioner,
        MenuPopup,
        MenuItem,
        MenuSeparator,
        MenuSubmenuTrigger,
        MenuCheckboxItem,
        MenuCheckboxItemIndicator,
        MenuGroup,
        MenuGroupLabel,
        MenuRadioGroup,
        MenuRadioItem,
        MenuRadioItemIndicator,
    ],
    template: `
        <div [class]="styles.stack">
            <div menubar aria-label="Application" [class]="styles.bar">
                <ng-container menuRoot>
                    <button menuTrigger [class]="styles.trigger">File</button>
                    <ng-container *menuPortal>
                        <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                            <div menuPopup [class]="styles.popup">
                                <div menuItem (click)="last.set('New file')" [class]="styles.item">New file</div>
                                <ng-container menuSubmenuRoot>
                                    <div menuSubmenuTrigger [class]="styles.submenuTrigger">Open recent</div>
                                    <ng-container *menuPortal>
                                        <div menuPositioner [class]="styles.positioner">
                                            <div menuPopup [class]="styles.popup">
                                                @for (file of recent; track file) {
                                                    <div menuItem (click)="last.set('Open ' + file)" [class]="styles.item">{{ file }}</div>
                                                }
                                            </div>
                                        </div>
                                    </ng-container>
                                </ng-container>
                                <div menuSeparator [class]="styles.separator"></div>
                                <div menuItem (click)="last.set('Save')" [class]="styles.item">Save</div>
                                <div menuItem [disabled]="true" [class]="styles.item">Export</div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
                <ng-container menuRoot>
                    <button menuTrigger [class]="styles.trigger">Edit</button>
                    <ng-container *menuPortal>
                        <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                            <div menuPopup [class]="styles.popup">
                                <div menuItem (click)="last.set('Undo')" [class]="styles.item">Undo</div>
                                <div menuItem (click)="last.set('Redo')" [class]="styles.item">Redo</div>
                                <div menuSeparator [class]="styles.separator"></div>
                                <div menuItem (click)="last.set('Cut')" [class]="styles.item">Cut</div>
                                <div menuItem (click)="last.set('Copy')" [class]="styles.item">Copy</div>
                                <div menuItem (click)="last.set('Paste')" [class]="styles.item">Paste</div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
                <ng-container menuRoot>
                    <button menuTrigger [class]="styles.trigger">View</button>
                    <ng-container *menuPortal>
                        <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                            <div menuPopup [class]="styles.popup">
                                <div menuCheckboxItem [(checked)]="ruler" [class]="styles.checkboxItem"><span *menuCheckboxItemIndicator [class]="styles.checkboxItemIndicator">✓</span>Show ruler</div>
                                <div menuCheckboxItem [(checked)]="wrap" [class]="styles.checkboxItem"><span *menuCheckboxItemIndicator [class]="styles.checkboxItemIndicator">✓</span>Word wrap</div>
                                <div menuSeparator [class]="styles.separator"></div>
                                <div menuGroup [class]="styles.group">
                                    <div menuGroupLabel [class]="styles.groupLabel">Zoom</div>
                                    <div menuRadioGroup [(value)]="zoom" [class]="styles.radioGroup">
                                        @for (entry of zooms; track entry.value) {
                                            <div menuRadioItem [value]="entry.value" [class]="styles.radioItem"><span *menuRadioItemIndicator [class]="styles.radioItemIndicator">•</span>{{ entry.label }}</div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
            </div>
            <dl [class]="styles.summary">
                <dt>Last command</dt>
                <dd>{{ last() }}</dd>
                <dt>Ruler</dt>
                <dd>{{ ruler() ? "shown" : "hidden" }}</dd>
                <dt>Word wrap</dt>
                <dd>{{ wrap() ? "on" : "off" }}</dd>
                <dt>Zoom</dt>
                <dd>{{ zoom() }}%</dd>
            </dl>
        </div>
    `,
})
export default class AppMenubar {
    protected readonly styles = styles;
    protected readonly recent = RECENT;
    protected readonly zooms = ZOOMS;
    protected readonly last = signal("none");
    protected readonly ruler = signal(true);
    protected readonly wrap = signal(false);
    protected readonly zoom = signal<string | null>("100");
}
