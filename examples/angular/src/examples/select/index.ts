import { Component } from "@angular/core";
import {
    SelectItem,
    SelectItemIndicator,
    SelectList,
    SelectPopup,
    SelectPortal,
    SelectPositioner,
    SelectRoot,
    SelectTrigger,
    SelectValue,
} from "@fragiola/primitives-angular/select";
import { styles } from "./styles.ts";

const FRUITS = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "cherry", label: "Cherry" },
    { value: "grape", label: "Grape" },
    { value: "mango", label: "Mango" },
    { value: "orange", label: "Orange", disabled: true },
];

// A fruit picker: focus stays on the trigger while the list is open, typing on it opens the list
// on the matching fruit, Enter or Tab chooses, and a disabled fruit cannot be chosen
// (spec/select.md).
@Component({
    selector: "example-fruit-picker",
    imports: [
        SelectRoot,
        SelectTrigger,
        SelectValue,
        SelectPortal,
        SelectPositioner,
        SelectPopup,
        SelectList,
        SelectItem,
        SelectItemIndicator,
    ],
    template: `
        <div [class]="styles.stack">
            <label for="fruit" [class]="styles.label">Fruit</label>
            <ng-container selectRoot [items]="fruits" name="fruit">
                <button selectTrigger id="fruit" [class]="styles.trigger"><span selectValue placeholder="Choose a fruit" [class]="styles.value"></span></button>
                <ng-container *selectPortal>
                    <div selectPositioner [class]="styles.positioner">
                        <div selectPopup [class]="styles.popup">
                            <div selectList [class]="styles.list">
                                @for (fruit of fruits; track fruit.value) {
                                    <div selectItem [value]="fruit.value" [class]="styles.item">{{ fruit.label }}<span *selectItemIndicator [class]="styles.itemIndicator">✓</span></div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
        </div>
    `,
})
export default class FruitPicker {
    protected readonly styles = styles;
    protected readonly fruits = FRUITS;
}
