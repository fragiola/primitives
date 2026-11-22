import { Component, ViewEncapsulation } from "@angular/core";
import { CalendarRoot } from "@fragiola/primitives-angular/calendar";
import { injectDirection } from "@fragiola/primitives-angular/direction";
import {
    SliderControl,
    SliderIndicator,
    SliderRoot,
    SliderThumb,
    SliderTrack,
} from "@fragiola/primitives-angular/slider";
import {
    TabsIndicator,
    TabsList,
    TabsPanel,
    TabsRoot,
    TabsTab,
} from "@fragiola/primitives-angular/tabs";
import { calendar } from "examples-shared/recipes/calendar";
import { menu } from "examples-shared/recipes/menu";
import { slider } from "examples-shared/recipes/slider";
import { tabs } from "examples-shared/recipes/tabs";
import { MonthView } from "../../kit/month-view.ts";
import { Output } from "../../kit/output.ts";
import { MENU_PARTS } from "../menu/menu-parts.ts";

const TABS = [
    { value: "account", label: "Account", disabled: false },
    { value: "password", label: "Password", disabled: false },
    { value: "billing", label: "Billing", disabled: true },
    { value: "team", label: "Team", disabled: false },
];

/**
 * Four direction-dependent components under a `rtl` provider in a document with no `dir`
 * (spec/direction.md). The route puts `[directionProvider]="'rtl'"` on the scenario's `<main>`, so
 * `injectDirection()` here reads it. A panel's text is two text nodes, as JSX makes
 * `{tab.label} settings`.
 */
@Component({
    selector: "[scenario-direction-provider]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        TabsRoot,
        TabsList,
        TabsTab,
        TabsIndicator,
        TabsPanel,
        SliderRoot,
        SliderControl,
        SliderTrack,
        SliderIndicator,
        SliderThumb,
        MENU_PARTS,
        CalendarRoot,
        MonthView,
        Output,
    ],
    template: `
        <div class="flex flex-col items-start gap-6">
            <div tabsRoot defaultValue="account" [class]="tabsStyles.root">
                <div tabsList [class]="tabsStyles.list">
                    @for (tab of tabs; track tab.value) {
                        <button tabsTab [value]="tab.value" [disabled]="tab.disabled" [class]="tabsStyles.tab">{{ tab.label }}</button>
                    }
                    <span *tabsIndicator="true" [class]="tabsStyles.indicator"></span>
                </div>
                @for (tab of tabs; track tab.value) {
                    <div *tabsPanel="tab.value" [class]="tabsStyles.panel"><p>@for (run of [tab.label, " settings"]; track $index) {<ng-container>{{ run }}</ng-container>}</p></div>
                }
            </div>
            <div sliderRoot [defaultValue]="50" [class]="sliderStyles.root">
                <div sliderControl [class]="sliderStyles.control"><div sliderTrack [class]="sliderStyles.track"><div sliderIndicator [class]="sliderStyles.indicator"></div><div sliderThumb aria-label="Volume" [class]="sliderStyles.thumb"></div></div></div>
            </div>
            <ng-container menuRoot>
                <button menuTrigger [class]="menuStyles.trigger">File</button>
                <ng-container *menuPortal>
                    <div menuPositioner [sideOffset]="4" [class]="menuStyles.positioner">
                        <div menuPopup [class]="menuStyles.popup">
                            <div menuItem [class]="menuStyles.item">New file</div>
                            <ng-container menuSubmenuRoot>
                                <div menuSubmenuTrigger [class]="menuStyles['submenu-trigger']">Share</div>
                                <ng-container *menuPortal>
                                    <div menuPositioner [class]="menuStyles.positioner">
                                        <div menuPopup [class]="menuStyles.popup">
                                            <div menuItem [class]="menuStyles.item">Email</div>
                                            <div menuItem [class]="menuStyles.item">Link</div>
                                        </div>
                                    </div>
                                </ng-container>
                            </ng-container>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
            <div calendarRoot locale="en-US" [class]="calendarStyles.root">
                <div monthView></div>
            </div>
        </div>
        <pre fixtureOutput [values]="{ direction: direction() }"></pre>
    `,
})
export class DirectionProviderScenario {
    protected readonly tabsStyles = tabs;
    protected readonly sliderStyles = slider;
    protected readonly menuStyles = menu;
    protected readonly calendarStyles = calendar;
    protected readonly tabs = TABS;
    /** What `injectDirection()` reads inside the provider. */
    protected readonly direction = injectDirection();
}
