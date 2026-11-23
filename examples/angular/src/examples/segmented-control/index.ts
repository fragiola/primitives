import { Component, signal } from "@angular/core";
import {
    SegmentedControlIndicator,
    SegmentedControlItem,
    SegmentedControlItemText,
    SegmentedControlRoot,
} from "@fragiola/primitives-angular/segmented-control";
import { styles } from "./styles.ts";

const VIEWS = [
    { value: "list", label: "List" },
    { value: "grid", label: "Grid" },
    { value: "board", label: "Board" },
];

const PROJECTS = ["Atlas", "Beacon", "Comet", "Drift", "Ember", "Flint"];

// A view switcher: one of three layouts for the same projects (spec/segmented-control.md). The
// control is one tab stop; every arrow moves the focus to the next view and checks it, and the
// Indicator, placed from its variables, slides under the checked segment. The app holds the view
// and lays the projects out by it.
@Component({
    selector: "example-view-switcher",
    imports: [
        SegmentedControlRoot,
        SegmentedControlItem,
        SegmentedControlItemText,
        SegmentedControlIndicator,
    ],
    template: `
        <div [class]="styles.stack">
            <span id="view-label" [class]="styles.label">View</span>
            <div segmentedControlRoot aria-labelledby="view-label" [(value)]="view" [class]="styles.root">
                @for (entry of views; track entry.value) {
                    <button segmentedControlItem [value]="entry.value" [class]="styles.item"><span segmentedControlItemText [class]="styles.itemText">{{ entry.label }}</span></button>
                }
                <span *segmentedControlIndicator [class]="styles.indicator"></span>
            </div>
            <ul aria-label="Projects" [attr.data-view]="view()" [class]="styles.projects">
                @for (project of projects; track project) {
                    <li [class]="styles.project">{{ project }}</li>
                }
            </ul>
        </div>
    `,
})
export default class ViewSwitcher {
    protected readonly styles = styles;
    protected readonly views = VIEWS;
    protected readonly projects = PROJECTS;
    protected readonly view = signal<string | null>("list");
}
