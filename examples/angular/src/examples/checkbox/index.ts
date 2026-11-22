import { Component } from "@angular/core";
import {
    CheckboxIndicator,
    CheckboxRoot,
} from "@fragiola/primitives-angular/checkbox";
import { CheckboxGroup } from "@fragiola/primitives-angular/checkbox-group";
import { styles } from "./styles.ts";

// Pizza toppings: a CheckboxGroup whose parent checkbox checks or clears every topping and shows
// the mixed state in between; Space toggles the focused checkbox (spec/checkbox.md).
@Component({
    selector: "example-pizza-toppings",
    imports: [CheckboxGroup, CheckboxRoot, CheckboxIndicator],
    template: `
        <div checkboxGroup aria-labelledby="toppings" [defaultValue]="initial" [allValues]="allValues" [class]="styles.group">
            <h2 id="toppings" [class]="styles.heading">Toppings</h2>
            <div [class]="styles.row">
                <button checkboxRoot id="all" parent [class]="styles.root"><span *checkboxIndicator [class]="styles.indicator"></span></button>
                <label for="all">All toppings</label>
            </div>
            <div [class]="styles.row">
                <button checkboxRoot id="cheese" value="cheese" [class]="styles.root"><span *checkboxIndicator [class]="styles.indicator"></span></button>
                <label for="cheese">Cheese</label>
            </div>
            <div [class]="styles.row">
                <button checkboxRoot id="ham" value="ham" [class]="styles.root"><span *checkboxIndicator [class]="styles.indicator"></span></button>
                <label for="ham">Ham</label>
            </div>
            <div [class]="styles.row">
                <button checkboxRoot id="pineapple" value="pineapple" [class]="styles.root"><span *checkboxIndicator [class]="styles.indicator"></span></button>
                <label for="pineapple">Pineapple</label>
            </div>
        </div>
    `,
})
export default class PizzaToppings {
    protected readonly styles = styles;
    protected readonly initial = ["cheese"];
    protected readonly allValues = ["cheese", "ham", "pineapple"];
}
