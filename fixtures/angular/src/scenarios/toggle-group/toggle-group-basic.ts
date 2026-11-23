import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Toggle } from "@fragiola/primitives-angular/toggle";
import {
    ToggleGroup,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/toggle-group";
import { toggle } from "examples-shared/recipes/toggle";
import { toggleGroup } from "examples-shared/recipes/toggle-group";
import { Output } from "../../kit/output.ts";

/** spec/toggle-group.md, `/toggle-group/basic` (and `?dir=rtl`) */
@Component({
    selector: "[scenario-toggle-group-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [Toggle, ToggleGroup, Output],
    template: `
        <div class="flex flex-wrap items-center gap-2">
            <button type="button">Before</button>
            <div toggleGroup aria-label="Alignment" [defaultValue]="initial" (valueChangeDetails)="onChange($event)" [class]="groupStyles.root">
                <button toggle [value]="'left'" [class]="styles.root">Left</button>
                <button toggle [value]="'center'" [class]="styles.root">Center</button>
                <button toggle [value]="'right'" [class]="styles.root">Right</button>
                <button toggle [value]="'justify'" [disabled]="true" [class]="styles.root">Justify</button>
            </div>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ value: value()?.join(','), reason: reason() }"></pre>
    `,
})
export class ToggleGroupBasic {
    protected readonly styles = toggle;
    protected readonly groupStyles = toggleGroup;
    protected readonly initial = ["left"];
    protected readonly value = signal<string[] | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);

    protected onChange(event: ValueChangeEvent<string[]>): void {
        this.value.set(event.value);
        this.reason.set(event.details.reason);
    }
}
