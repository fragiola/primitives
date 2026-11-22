import { Component, signal, ViewEncapsulation } from "@angular/core";
import { RadioIndicator, RadioRoot } from "@fragiola/primitives-angular/radio";
import { RadioGroup } from "@fragiola/primitives-angular/radio-group";
import { radio, radioGroup } from "examples-shared/recipes/radio-group";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { PLANS } from "./plans.ts";

/**
 * A required RadioGroup inside a form (spec/radio-group.md). Each hidden input follows its radio,
 * and each label's text is one text node after them, as in React.
 */
@Component({
    selector: "[scenario-radio-group-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [RadioGroup, RadioRoot, RadioIndicator, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <h2 id="plan" class="text-sm font-semibold">Plan</h2>
            <div radioGroup aria-labelledby="plan" [name]="'plan'" [required]="true" (valueChange)="value.set($event)" [class]="groupStyles.root">
                @for (plan of plans; track plan.value) {
                    <label class="flex items-center gap-2 text-sm"><button radioRoot [value]="plan.value" [disabled]="plan.disabled" [class]="styles.root"><span *radioIndicator [class]="styles.indicator"></span></button>{{ plan.label }}</label>
                }
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ value: value(), form: form() }"></pre>
    `,
})
export class RadioGroupBasic {
    protected readonly styles = radio;
    protected readonly groupStyles = radioGroup;
    protected readonly plans = PLANS;
    protected readonly value = signal<string | null | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
