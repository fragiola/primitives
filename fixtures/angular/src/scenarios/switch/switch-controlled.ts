import { Component, signal, ViewEncapsulation } from "@angular/core";
import { SwitchRoot, SwitchThumb } from "@fragiola/primitives-angular/switch";
import { switchControl } from "examples-shared/recipes/switch";
import { Output } from "../../kit/output.ts";

/** The consumer refuses to turn the switch off: it stays on. */
@Component({
    selector: "[scenario-switch-controlled]",
    encapsulation: ViewEncapsulation.None,
    imports: [SwitchRoot, SwitchThumb, Output],
    template: `
        <label class="flex items-center gap-2 text-sm"><button switchRoot [checked]="checked()" (checkedChange)="onCheckedChange($event)" [class]="styles.root"><span switchThumb [class]="styles.thumb"></span></button>Dark mode</label>
        <pre fixtureOutput [values]="{ checked: checked(), requested: requested() }"></pre>
    `,
})
export class SwitchControlled {
    protected readonly styles = switchControl;
    protected readonly checked = signal(true);
    protected readonly requested = signal<boolean | undefined>(undefined);

    protected onCheckedChange(next: boolean): void {
        this.requested.set(next);
        if (next) {
            this.checked.set(true);
        }
    }
}
