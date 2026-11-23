import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    Toggle,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/toggle";
import { toggle } from "examples-shared/recipes/toggle";
import { Output } from "../../kit/output.ts";

/**
 * spec/toggle.md, `/toggle/basic`. Flags and values are bound, not static attributes, so the
 * elements carry React's attributes only.
 */
@Component({
    selector: "[scenario-toggle-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [Toggle, Output],
    template: `
        <div class="flex flex-wrap items-center gap-2">
            <button toggle (pressedChangeDetails)="report('Bold', $event)" [class]="styles.root">Bold</button>
            <button toggle [defaultPressed]="true" (pressedChangeDetails)="report('Italic', $event)" [class]="styles.root">Italic</button>
            <button toggle [disabled]="true" (pressedChangeDetails)="report('Underline', $event)" [class]="styles.root">Underline</button>
            <span toggle [nativeButton]="false" (pressedChangeDetails)="report('Strike', $event)" [class]="styles.root">Strike</span>
        </div>
        <pre fixtureOutput [values]="{ toggle: last()?.toggle, pressed: last()?.pressed, reason: last()?.reason }"></pre>
    `,
})
export class ToggleBasic {
    protected readonly styles = toggle;
    protected readonly last = signal<
        { toggle: string; pressed: boolean; reason: string } | undefined
    >(undefined);

    protected report(name: string, event: ValueChangeEvent<boolean>): void {
        this.last.set({
            toggle: name,
            pressed: event.value,
            reason: event.details.reason,
        });
    }
}
