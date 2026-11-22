import { Component } from "@angular/core";
import {
    TabsIndicator,
    TabsList,
    TabsPanel,
    TabsRoot,
    TabsTab,
} from "@fragiola/primitives-angular/tabs";
import { styles } from "./styles.ts";

const SECTIONS = [
    {
        value: "account",
        label: "Account",
        text: "Your name, your email address and the language of the interface.",
        disabled: false,
    },
    {
        value: "password",
        label: "Password",
        text: "Change your password and see where you are signed in.",
        disabled: false,
    },
    {
        value: "notifications",
        label: "Notifications",
        text: "Choose which events send you an email.",
        disabled: false,
    },
    {
        value: "billing",
        label: "Billing",
        text: "Billing is managed by your organization.",
        disabled: true,
    },
];

// Settings in tabs: the arrow keys move between tabs and select (automatic activation), Home and
// End jump, a disabled tab stays focusable but is never selected, and the indicator follows. The
// panels stack in one grid cell and slide in and out from the side the selection moved to
// (`data-activation-direction`, `data-starting-style`, `data-ending-style`).
@Component({
    selector: "example-settings-tabs",
    imports: [TabsRoot, TabsList, TabsTab, TabsIndicator, TabsPanel],
    template: `
        <div tabsRoot defaultValue="account" [class]="styles.root">
            <div tabsList aria-label="Account settings" [class]="styles.list">
                @for (section of sections; track section.value) {
                    <button tabsTab [value]="section.value" [disabled]="section.disabled" [class]="styles.tab">{{ section.label }}</button>
                }
                <span *tabsIndicator [class]="styles.indicator"></span>
            </div>
            <div [class]="styles.panels">
                @for (section of sections; track section.value) {
                    <div *tabsPanel="section.value" [class]="styles.panel">
                        <h3 [class]="styles.heading">{{ section.label }}</h3>
                        <p [class]="styles.text">{{ section.text }}</p>
                    </div>
                }
            </div>
        </div>
    `,
})
export default class SettingsTabs {
    protected readonly styles = styles;
    protected readonly sections = SECTIONS;
}
