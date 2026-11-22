import { Component, ViewEncapsulation } from "@angular/core";
import {
    TabsIndicator,
    TabsList,
    TabsPanel,
    TabsRoot,
    TabsTab,
} from "@fragiola/primitives-angular/tabs";
import { tabs } from "examples-shared/recipes/tabs";

const TABS = [
    { value: "account", label: "Account" },
    { value: "password", label: "Password" },
];

/** spec/tabs.md, `/tabs/none-selected`: every tab disabled, so no tab is selected. */
@Component({
    selector: "[scenario-tabs-none-selected]",
    encapsulation: ViewEncapsulation.None,
    imports: [TabsRoot, TabsList, TabsTab, TabsIndicator, TabsPanel],
    template: `
        <div tabsRoot [class]="styles.root">
            <div tabsList [class]="styles.list">
                @for (tab of tabs; track tab.value) {
                    <button tabsTab [value]="tab.value" disabled [class]="styles.tab">{{ tab.label }}</button>
                }
                <span *tabsIndicator [class]="styles.indicator"></span>
            </div>
            @for (tab of tabs; track tab.value) {
                <div *tabsPanel="tab.value" [class]="styles.panel"><p>@for (run of [tab.label, " settings"]; track $index) {<ng-container>{{ run }}</ng-container>}</p></div>
            }
        </div>
    `,
})
export class TabsNoneSelected {
    protected readonly styles = tabs;
    protected readonly tabs = TABS;
}
