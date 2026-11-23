import { Component } from "@angular/core";
import { Label } from "@fragiola/primitives-angular/label";
import {
    NumberFieldDecrement,
    NumberFieldGroup,
    NumberFieldIncrement,
    NumberFieldInput,
    NumberFieldRoot,
    NumberFieldScrubArea,
    NumberFieldScrubAreaCursor,
} from "@fragiola/primitives-angular/number-field";
import { styles } from "./styles.ts";

const PERCENT = { style: "percent" } as const;

// A cart line: a quantity from 1 to 10, stepped by its buttons (held, they repeat), the arrows,
// Page Up and Down, or typed; and a discount written as a percentage, whose label is a scrub
// area: drag it sideways to change the value (spec/number-field.md).
@Component({
    selector: "example-quantity-field",
    imports: [
        Label,
        NumberFieldRoot,
        NumberFieldGroup,
        NumberFieldInput,
        NumberFieldIncrement,
        NumberFieldDecrement,
        NumberFieldScrubArea,
        NumberFieldScrubAreaCursor,
    ],
    template: `
        <div [class]="styles.stack">
            <label label for="quantity" [class]="styles.label">Quantity</label>
            <div numberFieldRoot [id]="'quantity'" [defaultValue]="1" [min]="1" [max]="10" [class]="styles.root">
                <div numberFieldGroup [class]="styles.group">
                    <button numberFieldDecrement aria-label="Decrease" [class]="styles.decrement">−</button>
                    <input numberFieldInput [class]="styles.input" />
                    <button numberFieldIncrement aria-label="Increase" [class]="styles.increment">+</button>
                </div>
            </div>
            <div numberFieldRoot [id]="'discount'" [defaultValue]="0.1" [min]="0" [max]="1" [step]="0.01" [format]="percent" [class]="styles.root">
                <span numberFieldScrubArea [class]="styles.scrubArea"><label label for="discount" [class]="styles.label">Discount</label><span *numberFieldScrubAreaCursor [class]="styles.scrubAreaCursor"></span></span>
                <div numberFieldGroup [class]="styles.group"><input numberFieldInput [class]="styles.input" /></div>
            </div>
        </div>
    `,
})
export default class QuantityField {
    protected readonly styles = styles;
    protected readonly percent = PERCENT;
}
