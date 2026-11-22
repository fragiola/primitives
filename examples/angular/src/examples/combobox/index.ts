import { Component } from "@angular/core";
import {
    ComboboxChip,
    ComboboxChipRemove,
    ComboboxChips,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxItemIndicator,
    ComboboxList,
    ComboboxPopup,
    ComboboxPortal,
    ComboboxPositioner,
    ComboboxRoot,
} from "@fragiola/primitives-angular/combobox";
import { styles } from "./styles.ts";

interface Fruit {
    value: string;
    label: string;
}

const FRUITS: Fruit[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "cherry", label: "Cherry" },
    { value: "grape", label: "Grape" },
    { value: "mango", label: "Mango" },
];

// Fruit tags: typing filters the list, Enter adds the highlighted fruit as a chip, Backspace in
// the empty input removes the last one, and Escape resets the text (spec/combobox.md, D10).
@Component({
    selector: "example-fruit-tags",
    imports: [
        ComboboxRoot,
        ComboboxChips,
        ComboboxChip,
        ComboboxChipRemove,
        ComboboxInput,
        ComboboxPortal,
        ComboboxPositioner,
        ComboboxPopup,
        ComboboxEmpty,
        ComboboxList,
        ComboboxItem,
        ComboboxItemIndicator,
    ],
    template: `
        <div [class]="styles.stack">
            <label for="fruits" [class]="styles.label">Fruits</label>
            <ng-container comboboxRoot #combobox="comboboxRoot" multiple [items]="fruits" [defaultValue]="initial" name="fruits">
                <div comboboxChips [class]="styles.chips">
                    @for (fruit of asFruits(combobox.value()); track fruit.value) {
                        <div comboboxChip [class]="styles.chip">{{ fruit.label }}<button comboboxChipRemove [attr.aria-label]="'Remove ' + fruit.label" [class]="styles.chipRemove">×</button></div>
                    }
                    <input comboboxInput id="fruits" [class]="styles.input" />
                </div>
                <ng-container *comboboxPortal>
                    <div comboboxPositioner [sideOffset]="4" [class]="styles.positioner">
                        <div comboboxPopup [class]="styles.popup">
                            <div comboboxEmpty [class]="styles.empty">No fruit found.</div>
                            <div comboboxList #list="comboboxList" [class]="styles.list">
                                @for (fruit of asFruits(list.entries()); track fruit.value) {
                                    <div comboboxItem [value]="fruit" [class]="styles.item">{{ fruit.label }}<span *comboboxItemIndicator [class]="styles.itemIndicator">✓</span></div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
        </div>
    `,
})
export default class FruitTags {
    protected readonly styles = styles;
    protected readonly fruits = FRUITS;
    protected readonly initial = [FRUITS[0]];
    /**
     * The combobox's values or the List's entries, as fruits: its API types an item as
     * `unknown`, the consumer's own type.
     */
    protected asFruits(items: unknown): readonly Fruit[] {
        return items as readonly Fruit[];
    }
}
