import { Component, signal, ViewEncapsulation } from "@angular/core";
import { SwitchRoot, SwitchThumb } from "@fragiola/primitives-angular/switch";
import { switchControl } from "examples-shared/recipes/switch";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";

/**
 * The switches inside a form (spec/switch.md). Each hidden input follows its switch, and each
 * label's text is one text node after them, as in React; the inputs are bound, so the buttons
 * carry no `name` or `value` attribute of their own.
 */
@Component({
    selector: "[scenario-switch-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [SwitchRoot, SwitchThumb, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <label class="flex items-center gap-2 text-sm"><button switchRoot [name]="'wifi'" [defaultChecked]="true" (checkedChange)="wifi.set($event)" [class]="styles.root"><span switchThumb [class]="styles.thumb"></span></button>Wi-Fi</label>
            <label class="flex items-center gap-2 text-sm"><button switchRoot [name]="'bluetooth'" [value]="'yes'" [uncheckedValue]="'no'" [class]="styles.root"><span switchThumb [class]="styles.thumb"></span></button>Bluetooth</label>
            <label class="flex items-center gap-2 text-sm"><button switchRoot [name]="'terms'" [required]="true" [class]="styles.root"><span switchThumb [class]="styles.thumb"></span></button>Accept terms</label>
            <label class="flex items-center gap-2 text-sm"><button switchRoot [name]="'location'" [defaultChecked]="true" [readOnly]="true" [class]="styles.root"><span switchThumb [class]="styles.thumb"></span></button>Location</label>
            <label class="flex items-center gap-2 text-sm"><button switchRoot [disabled]="true" [class]="styles.root"><span switchThumb [class]="styles.thumb"></span></button>Airplane mode</label>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ wifi: wifi(), form: form() }"></pre>
    `,
})
export class SwitchBasic {
    protected readonly styles = switchControl;
    protected readonly wifi = signal<boolean | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
