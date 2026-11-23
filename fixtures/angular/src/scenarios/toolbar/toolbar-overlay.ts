import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Toggle } from "@fragiola/primitives-angular/toggle";
import { ToggleGroup } from "@fragiola/primitives-angular/toggle-group";
import {
    ToolbarButton,
    ToolbarRoot,
} from "@fragiola/primitives-angular/toolbar";
import { popover } from "examples-shared/recipes/popover";
import { toggle } from "examples-shared/recipes/toggle";
import { toggleGroup } from "examples-shared/recipes/toggle-group";
import { toolbar } from "examples-shared/recipes/toolbar";
import { Output } from "../../kit/output.ts";
import { POPOVER_PARTS } from "../popover/popover-parts.ts";

/** spec/toolbar.md, `/toolbar/overlay` */
@Component({
    selector: "[scenario-toolbar-overlay]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        Toggle,
        ToggleGroup,
        ToolbarRoot,
        ToolbarButton,
        POPOVER_PARTS,
        Output,
    ],
    template: `
        <div class="flex flex-wrap items-center gap-2">
            <div toolbarRoot aria-label="Formatting" [class]="styles.root">
                <button toolbarButton [class]="styles.button">Undo</button>
                <ng-container popoverRoot>
                    <button toolbarButton popoverTrigger [class]="styles.button">More</button>
                    <ng-container *popoverPortal>
                        <div popoverPositioner [sideOffset]="4" [class]="popoverStyles.positioner">
                            <div popoverPopup [class]="popoverStyles.popup">
                                <div toggleGroup aria-label="Alignment" (valueChange)="align.set($event)" [class]="groupStyles.root">
                                    <button toggle [value]="'left'" [class]="toggleStyles.root">Left</button>
                                    <button toggle [value]="'center'" [class]="toggleStyles.root">Center</button>
                                </div>
                                <button toggle [class]="toggleStyles.root">Wrap</button>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
            </div>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ align: align()?.join(',') }"></pre>
    `,
})
export class ToolbarOverlay {
    protected readonly styles = toolbar;
    protected readonly popoverStyles = popover;
    protected readonly toggleStyles = toggle;
    protected readonly groupStyles = toggleGroup;
    protected readonly align = signal<string[] | undefined>(undefined);
}
