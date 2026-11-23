import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Toggle } from "@fragiola/primitives-angular/toggle";
import {
    ToggleGroup,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/toggle-group";
import { toggle } from "examples-shared/recipes/toggle";
import { toggleGroup } from "examples-shared/recipes/toggle-group";
import { Output } from "../../kit/output.ts";

/** spec/toggle-group.md, `/toggle-group/vertical` */
@Component({
    selector: "[scenario-toggle-group-vertical]",
    encapsulation: ViewEncapsulation.None,
    imports: [Toggle, ToggleGroup, Output],
    template: `
        <div toggleGroup aria-label="Text style" [multiple]="true" [orientation]="'vertical'" [loopFocus]="false" [value]="value()" (valueChangeDetails)="onChange($event)" [class]="groupStyles.root">
            <button toggle [value]="'bold'" [class]="styles.root">Bold</button>
            <button toggle [value]="'italic'" [class]="styles.root">Italic</button>
            <button toggle [value]="'underline'" [class]="styles.root">Underline</button>
        </div>
        <pre fixtureOutput [values]="{ value: changed()?.join(','), reason: reason() }"></pre>
    `,
})
export class ToggleGroupVertical {
    protected readonly styles = toggle;
    protected readonly groupStyles = toggleGroup;
    protected readonly value = signal<readonly string[]>(["bold"]);
    protected readonly changed = signal<string[] | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);

    protected onChange(event: ValueChangeEvent<string[]>): void {
        this.value.set(event.value);
        this.changed.set(event.value);
        this.reason.set(event.details.reason);
    }
}
