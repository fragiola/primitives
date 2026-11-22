import { Component, signal, ViewEncapsulation } from "@angular/core";
import { RadioIndicator, RadioRoot } from "@fragiola/primitives-angular/radio";
import { RadioGroup } from "@fragiola/primitives-angular/radio-group";
import { radio, radioGroup } from "examples-shared/recipes/radio-group";
import { Output } from "../../kit/output.ts";

const SIZES = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
];

/** The consumer refuses `large`: the value stays. */
@Component({
    selector: "[scenario-radio-group-controlled]",
    encapsulation: ViewEncapsulation.None,
    imports: [RadioGroup, RadioRoot, RadioIndicator, Output],
    template: `
        <h2 id="size" class="text-sm font-semibold">Size</h2>
        <div radioGroup aria-labelledby="size" [orientation]="'horizontal'" [loopFocus]="false" [value]="value()" (valueChange)="onValueChange($event)" [class]="groupStyles.root">
            @for (size of sizes; track size.value) {
                <label class="flex items-center gap-2 text-sm"><button radioRoot [value]="size.value" [class]="styles.root"><span *radioIndicator [class]="styles.indicator"></span></button>{{ size.label }}</label>
            }
        </div>
        <pre fixtureOutput [values]="{ value: value(), requested: requested() }"></pre>
    `,
})
export class RadioGroupControlled {
    protected readonly styles = radio;
    protected readonly groupStyles = radioGroup;
    protected readonly sizes = SIZES;
    protected readonly value = signal("medium");
    protected readonly requested = signal<string | null | undefined>(undefined);

    protected onValueChange(next: string | null): void {
        this.requested.set(next);
        if (next !== null && next !== "large") {
            this.value.set(next);
        }
    }
}
