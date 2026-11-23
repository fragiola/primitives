import { Component, computed, signal } from "@angular/core";
import {
    ListboxItem,
    ListboxItemIndicator,
    ListboxRoot,
    type ListboxValue,
} from "@fragiola/primitives-angular/listbox";
import { styles } from "./styles.ts";

const TOPPINGS = [
    { value: "cheese", label: "Cheese" },
    { value: "mushrooms", label: "Mushrooms" },
    { value: "olives", label: "Olives" },
    { value: "onions", label: "Onions" },
    { value: "peppers", label: "Peppers" },
    { value: "pineapple", label: "Pineapple" },
    { value: "spinach", label: "Spinach" },
];

// A transfer list: select toppings in one list (Space toggles, Shift with the arrows or a press
// selects a range, Ctrl+A selects them all) and move them to the other (spec/listbox.md).
@Component({
    selector: "example-transfer-list",
    imports: [ListboxRoot, ListboxItem, ListboxItemIndicator],
    template: `
        <div [class]="styles.row">
            <div [class]="styles.column">
                <span id="available" [class]="styles.heading">Available</span>
                <div listboxRoot aria-labelledby="available" [multiple]="true" [value]="toAdd()" (valueChange)="toAdd.set(asValues($event))" [class]="styles.list">
                    @for (item of available(); track item.value) {
                        <div listboxItem [value]="item.value" [class]="styles.item">{{ item.label }}<span *listboxItemIndicator [class]="styles.itemIndicator">✓</span></div>
                    }
                </div>
            </div>
            <div [class]="styles.buttons">
                <button type="button" [class]="styles.button" [disabled]="toAdd().length === 0" (click)="add()">Add</button>
                <button type="button" [class]="styles.button" [disabled]="toRemove().length === 0" (click)="remove()">Remove</button>
            </div>
            <div [class]="styles.column">
                <span id="chosen" [class]="styles.heading">Chosen</span>
                <div listboxRoot aria-labelledby="chosen" [multiple]="true" name="toppings" [value]="toRemove()" (valueChange)="toRemove.set(asValues($event))" [class]="styles.list">
                    @for (item of picked(); track item.value) {
                        <div listboxItem [value]="item.value" [class]="styles.item">{{ item.label }}<span *listboxItemIndicator [class]="styles.itemIndicator">✓</span></div>
                    }
                </div>
            </div>
        </div>
    `,
})
export default class TransferList {
    protected readonly styles = styles;
    protected readonly chosen = signal<readonly string[]>(["cheese"]);
    protected readonly toAdd = signal<readonly string[]>([]);
    protected readonly toRemove = signal<readonly string[]>([]);
    protected readonly available = computed(() =>
        TOPPINGS.filter((item) => !this.chosen().includes(item.value)),
    );
    protected readonly picked = computed(() =>
        TOPPINGS.filter((item) => this.chosen().includes(item.value)),
    );

    /** A multiple list's value: its selected values. */
    protected asValues(value: ListboxValue): readonly string[] {
        return value as readonly string[];
    }

    protected add(): void {
        this.chosen.set([...this.chosen(), ...this.toAdd()]);
        this.toAdd.set([]);
    }

    protected remove(): void {
        this.chosen.set(
            this.chosen().filter((value) => !this.toRemove().includes(value)),
        );
        this.toRemove.set([]);
    }
}
