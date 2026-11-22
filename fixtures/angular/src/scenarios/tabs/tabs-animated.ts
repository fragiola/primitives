import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    TabsIndicator,
    TabsList,
    TabsPanel,
    TabsRoot,
    TabsTab,
} from "@fragiola/primitives-angular/tabs";
import { tabs } from "examples-shared/recipes/tabs";
import { Output } from "../../kit/output.ts";

const TABS = [
    { value: "overview", label: "Overview" },
    { value: "projects", label: "Projects" },
    { value: "settings", label: "Settings" },
];

/**
 * spec/tabs.md, `/tabs/animated` (and `?dir=rtl`): panels that enter and exit, stacked in one
 * grid cell. A panel's text is two text nodes, as JSX makes `{tab.label} content`.
 */
@Component({
    selector: "[scenario-tabs-animated]",
    encapsulation: ViewEncapsulation.None,
    imports: [TabsRoot, TabsList, TabsTab, TabsIndicator, TabsPanel, Output],
    template: `
        <div tabsRoot defaultValue="overview" (valueChange)="value.set($event)" [class]="styles.root">
            <div tabsList [class]="styles.list">
                @for (tab of tabs; track tab.value) {
                    <button tabsTab [value]="tab.value" [class]="styles.tab">{{ tab.label }}</button>
                }
                <span *tabsIndicator [class]="styles.indicator"></span>
            </div>
            <div [class]="styles.panels">
                @for (tab of tabs; track tab.value) {
                    <div *tabsPanel="tab.value; keepMounted: true" [class]="panelClass"><p>@for (run of [tab.label, " content"]; track $index) {<ng-container>{{ run }}</ng-container>}</p></div>
                }
            </div>
        </div>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class TabsAnimated {
    protected readonly styles = tabs;
    protected readonly panelClass = `${tabs.panel} ${tabs.motion}`;
    protected readonly tabs = TABS;
    protected readonly value = signal<string | undefined>(undefined);
}
