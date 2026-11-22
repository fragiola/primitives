import { Component, computed, signal } from "@angular/core";
import {
    MenuCheckboxItem,
    MenuCheckboxItemIndicator,
    MenuGroup,
    MenuGroupLabel,
    MenuPopup,
    MenuPortal,
    MenuPositioner,
    MenuRadioGroup,
    MenuRadioItem,
    MenuRadioItemIndicator,
    MenuRoot,
    MenuSeparator,
    MenuTrigger,
} from "@fragiola/primitives-angular/menu";
import { styles } from "./styles.ts";

const SORTS = [
    { value: "name", label: "Name" },
    { value: "date", label: "Date modified" },
    { value: "size", label: "Size" },
];

// A "View" menu of options: Space toggles a checkbox item or checks a radio item and keeps the
// menu open, Enter does it and closes the menu, and a click keeps it open (spec/menu.md).
@Component({
    selector: "example-view-options",
    imports: [
        MenuRoot,
        MenuTrigger,
        MenuPortal,
        MenuPositioner,
        MenuPopup,
        MenuCheckboxItem,
        MenuCheckboxItemIndicator,
        MenuSeparator,
        MenuGroup,
        MenuGroupLabel,
        MenuRadioGroup,
        MenuRadioItem,
        MenuRadioItemIndicator,
    ],
    template: `
        <div [class]="styles.stack">
            <ng-container menuRoot>
                <button menuTrigger [class]="styles.trigger">View</button>
                <ng-container *menuPortal>
                    <div menuPositioner [sideOffset]="4" [class]="styles.positioner">
                        <div menuPopup [class]="styles.popup">
                            <div menuCheckboxItem [(checked)]="toolbar" [class]="styles.checkboxItem"><span *menuCheckboxItemIndicator [class]="styles.checkboxItemIndicator">✓</span>Show toolbar</div>
                            <div menuCheckboxItem [(checked)]="statusBar" [class]="styles.checkboxItem"><span *menuCheckboxItemIndicator [class]="styles.checkboxItemIndicator">✓</span>Show status bar</div>
                            <div menuSeparator [class]="styles.separator"></div>
                            <div menuGroup [class]="styles.group">
                                <div menuGroupLabel [class]="styles.groupLabel">Sort by</div>
                                <div menuRadioGroup [(value)]="sort" [class]="styles.radioGroup">
                                    @for (entry of sorts; track entry.value) {
                                        <div menuRadioItem [value]="entry.value" [class]="styles.radioItem"><span *menuRadioItemIndicator [class]="styles.radioItemIndicator">•</span>{{ entry.label }}</div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
            <dl [class]="styles.summary">
                <dt>Toolbar</dt>
                <dd>{{ toolbar() ? "shown" : "hidden" }}</dd>
                <dt>Status bar</dt>
                <dd>{{ statusBar() ? "shown" : "hidden" }}</dd>
                <dt>Sorted by</dt>
                <dd>{{ sortLabel() }}</dd>
            </dl>
        </div>
    `,
})
export default class ViewOptions {
    protected readonly styles = styles;
    protected readonly sorts = SORTS;
    protected readonly toolbar = signal(true);
    protected readonly statusBar = signal(false);
    protected readonly sort = signal<string | null>("name");
    protected readonly sortLabel = computed(
        () => SORTS.find((entry) => entry.value === this.sort())?.label,
    );
}
