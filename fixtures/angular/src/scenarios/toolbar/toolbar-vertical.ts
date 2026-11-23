import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Toggle } from "@fragiola/primitives-angular/toggle";
import { ToggleGroup } from "@fragiola/primitives-angular/toggle-group";
import {
    ToolbarButton,
    ToolbarRoot,
    ToolbarSeparator,
} from "@fragiola/primitives-angular/toolbar";
import { toggle } from "examples-shared/recipes/toggle";
import { toggleGroup } from "examples-shared/recipes/toggle-group";
import { toolbar } from "examples-shared/recipes/toolbar";
import { Output } from "../../kit/output.ts";

/** spec/toolbar.md, `/toolbar/vertical` */
@Component({
    selector: "[scenario-toolbar-vertical]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        Toggle,
        ToggleGroup,
        ToolbarRoot,
        ToolbarButton,
        ToolbarSeparator,
        Output,
    ],
    template: `
        <div class="flex items-start gap-2">
            <div toolbarRoot aria-label="Tools" [orientation]="'vertical'" [loopFocus]="false" [class]="styles.root">
                <button toolbarButton [class]="styles.button">Select</button>
                <button toolbarButton [class]="styles.button">Draw</button>
                <div toolbarSeparator [class]="styles.separator"></div>
                <button toggle (pressedChange)="snap.set($event)" [class]="toggleStyles.root">Snap</button>
                <div toggleGroup aria-label="Zoom" (valueChange)="zoom.set($event)" [class]="groupStyles.root">
                    <button toggle [value]="'fit'" [class]="toggleStyles.root">Fit</button>
                    <button toggle [value]="'fill'" [class]="toggleStyles.root">Fill</button>
                </div>
            </div>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ snap: snap(), zoom: zoom()?.join(',') }"></pre>
    `,
})
export class ToolbarVertical {
    protected readonly styles = toolbar;
    protected readonly toggleStyles = toggle;
    protected readonly groupStyles = toggleGroup;
    protected readonly snap = signal<boolean | undefined>(undefined);
    protected readonly zoom = signal<string[] | undefined>(undefined);
}
