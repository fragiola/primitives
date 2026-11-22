import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Button } from "@fragiola/primitives-angular/button";
import { button } from "examples-shared/recipes/button";
import { Output } from "../../kit/output.ts";

/**
 * Native and non-native buttons, enabled, disabled and focusable while disabled (spec/button.md).
 * Flags are bound, not static attributes, so the elements carry React's attributes only.
 */
@Component({
    selector: "[scenario-button-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [Button, Output],
    template: `
        <div class="flex flex-wrap items-center gap-2">
            <button button (click)="press('Save')" [class]="styles.root">Save</button>
            <button button [disabled]="true" (click)="press('Delete')" [class]="styles.root">Delete</button>
            <button button [disabled]="true" [focusableWhenDisabled]="true" (click)="press('Publishing')" [class]="styles.root">Publishing</button>
            <span button [nativeButton]="false" (click)="press('Archive')" [class]="styles.root">Archive</span>
            <span button [nativeButton]="false" [disabled]="true" (click)="press('Locked')" [class]="styles.root">Locked</span>
        </div>
        <pre fixtureOutput [values]="{ pressed: pressed(), count: count() }"></pre>
    `,
})
export class ButtonBasic {
    protected readonly styles = button;
    protected readonly pressed = signal<string | undefined>(undefined);
    protected readonly count = signal(0);

    protected press(name: string): void {
        this.pressed.set(name);
        this.count.update((current) => current + 1);
    }
}
