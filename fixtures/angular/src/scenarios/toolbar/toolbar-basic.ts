import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Toggle } from "@fragiola/primitives-angular/toggle";
import { ToggleGroup } from "@fragiola/primitives-angular/toggle-group";
import {
    ToolbarButton,
    ToolbarGroup,
    ToolbarInput,
    ToolbarLink,
    ToolbarRoot,
    ToolbarSeparator,
} from "@fragiola/primitives-angular/toolbar";
import { toggle } from "examples-shared/recipes/toggle";
import { toggleGroup } from "examples-shared/recipes/toggle-group";
import { toolbar } from "examples-shared/recipes/toolbar";
import { Output } from "../../kit/output.ts";

/** spec/toolbar.md, `/toolbar/basic` (and `?dir=rtl`) */
@Component({
    selector: "[scenario-toolbar-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        Toggle,
        ToggleGroup,
        ToolbarRoot,
        ToolbarButton,
        ToolbarLink,
        ToolbarInput,
        ToolbarGroup,
        ToolbarSeparator,
        Output,
    ],
    template: `
        <div class="flex flex-wrap items-center gap-2">
            <button type="button">Before</button>
            <div toolbarRoot aria-label="Formatting" [class]="styles.root">
                <div toggleGroup aria-label="Text style" [multiple]="true" (valueChange)="style.set($event)" [class]="groupStyles.root">
                    <button toggle [value]="'bold'" [class]="toggleStyles.root">Bold</button>
                    <button toggle [value]="'italic'" [class]="toggleStyles.root">Italic</button>
                </div>
                <div toolbarSeparator [class]="styles.separator"></div>
                <div toolbarGroup aria-label="History" [class]="styles.group">
                    <button toolbarButton (click)="pressed.set('Undo')" [class]="styles.button">Undo</button>
                    <button toolbarButton [disabled]="true" (click)="pressed.set('Redo')" [class]="styles.button">Redo</button>
                </div>
                <div toolbarSeparator [class]="styles.separator"></div>
                <button toolbarButton [disabled]="true" [focusableWhenDisabled]="true" (click)="pressed.set('Share')" [class]="styles.button">Share</button>
                <a toolbarLink href="#help" [class]="styles.link">Help</a>
                <input toolbarInput aria-label="Search" value="draft" [class]="styles.input">
            </div>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ style: style()?.join(','), pressed: pressed() }"></pre>
    `,
})
export class ToolbarBasic {
    protected readonly styles = toolbar;
    protected readonly toggleStyles = toggle;
    protected readonly groupStyles = toggleGroup;
    protected readonly style = signal<string[] | undefined>(undefined);
    protected readonly pressed = signal<string | undefined>(undefined);
}
