import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Toggle } from "@fragiola/primitives-angular/toggle";
import { toggle } from "examples-shared/recipes/toggle";
import { Output } from "../../kit/output.ts";

/** spec/toggle.md, `/toggle/controlled`: while "Locked" is checked, the fixture refuses every change. */
@Component({
    selector: "[scenario-toggle-controlled]",
    encapsulation: ViewEncapsulation.None,
    imports: [Toggle, Output],
    template: `
        <div class="flex flex-wrap items-center gap-4">
            <button toggle [pressed]="pressed()" (pressedChange)="onPressedChange($event)" [class]="styles.root">Mute</button>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" [checked]="locked()" (change)="onLockedChange($event)">Locked</label>
        </div>
        <pre fixtureOutput [values]="{ pressed: pressed(), requested: requested() }"></pre>
    `,
})
export class ToggleControlled {
    protected readonly styles = toggle;
    protected readonly pressed = signal(true);
    protected readonly requested = signal<boolean | undefined>(undefined);
    protected readonly locked = signal(false);

    protected onPressedChange(next: boolean): void {
        this.requested.set(next);
        if (!this.locked()) {
            this.pressed.set(next);
        }
    }

    protected onLockedChange(event: Event): void {
        this.locked.set((event.target as HTMLInputElement).checked);
    }
}
