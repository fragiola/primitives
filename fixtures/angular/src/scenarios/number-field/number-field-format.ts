import { Component, input, signal, ViewEncapsulation } from "@angular/core";
import { Label } from "@fragiola/primitives-angular/label";
import { label } from "examples-shared/recipes/label";
import { numberField } from "examples-shared/recipes/number-field";
import { Output } from "../../kit/output.ts";
import { NUMBER_FIELD_PARTS } from "./number-field-parts.ts";

const EUR = { style: "currency", currency: "EUR" } as const;
const PERCENT = { style: "percent" } as const;

/** spec/number-field.md, `/number-field/format` (`?locale=`, and `?dir=rtl`): a price and a discount. */
@Component({
    selector: "[scenario-number-field-format]",
    encapsulation: ViewEncapsulation.None,
    imports: [Label, NUMBER_FIELD_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-4">
            <div class="flex flex-col items-start gap-1">
                <label label for="price" [class]="labelStyles.root">Price</label>
                <div numberFieldRoot [id]="'price'" [format]="eur" [defaultValue]="1234.5" [step]="0.5" [locale]="locale()" (valueChange)="price.set($event)" [class]="styles.root">
                    <div numberFieldGroup [class]="styles.group"><input numberFieldInput [class]="styles.input" /></div>
                </div>
            </div>
            <div class="flex flex-col items-start gap-1">
                <label label for="discount" [class]="labelStyles.root">Discount</label>
                <div numberFieldRoot [id]="'discount'" [format]="percent" [defaultValue]="0.25" [step]="0.01" [min]="0" [max]="1" [locale]="locale()" (valueChange)="discount.set($event)" [class]="styles.root">
                    <div numberFieldGroup [class]="styles.group"><input numberFieldInput [class]="styles.input" /></div>
                </div>
            </div>
        </div>
        <pre fixtureOutput [values]="{ price: shown(price()), discount: shown(discount()) }"></pre>
    `,
})
export class NumberFieldFormat {
    readonly locale = input<string | undefined>(undefined);
    protected readonly styles = numberField;
    protected readonly labelStyles = label;
    protected readonly eur = EUR;
    protected readonly percent = PERCENT;
    protected readonly price = signal<number | null | undefined>(undefined);
    protected readonly discount = signal<number | null | undefined>(undefined);
    protected readonly shown = (value: number | null | undefined) =>
        value === null ? "null" : value;
}
