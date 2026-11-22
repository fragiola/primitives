import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { OpenChangeEvent } from "@fragiola/primitives-angular/select";
import { select } from "examples-shared/recipes/select";
import { Output } from "../../kit/output.ts";
import { SELECT_PARTS } from "./select-parts.ts";

interface Food {
    value: string;
    label: string;
    disabled?: boolean;
}

const FRUITS: readonly Food[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
];

const VEGETABLES: readonly Food[] = [
    { value: "carrot", label: "Carrot" },
    { value: "leek", label: "Leek", disabled: true },
    { value: "potato", label: "Potato" },
];

/** spec/select.md: groups, a separator and item texts, with no `items` (the list kept mounted). */
@Component({
    selector: "[scenario-select-groups]",
    encapsulation: ViewEncapsulation.None,
    imports: [SELECT_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-2">
            <label for="food" class="text-sm font-medium">Food</label>
            <ng-container selectRoot [defaultValue]="'carrot'" (valueChange)="value.set($event)" (openChangeDetails)="onOpenChange($event)">
                <button selectTrigger id="food" [class]="styles.trigger"><span selectValue [placeholder]="'Choose a food'" [class]="styles.value"></span></button>
                <ng-container *selectPortal="{ keepMounted: true }">
                    <div selectPositioner [class]="styles.positioner">
                        <div selectPopup [class]="styles.popup">
                            <div selectList [class]="styles.list">
                                <div selectGroup [class]="styles.group">
                                    <div selectGroupLabel [class]="styles['group-label']">Fruits</div>
                                    @for (item of fruits; track item.value) {
                                        <div selectItem [value]="item.value" [disabled]="item.disabled" [class]="styles.item"><span selectItemText [class]="styles['item-text']">{{ item.label }}</span><span *selectItemIndicator [class]="styles['item-indicator']">✓</span></div>
                                    }
                                </div>
                                <div selectSeparator [class]="styles.separator"></div>
                                <div selectGroup [class]="styles.group">
                                    <div selectGroupLabel [class]="styles['group-label']">Vegetables</div>
                                    @for (item of vegetables; track item.value) {
                                        <div selectItem [value]="item.value" [disabled]="item.disabled" [class]="styles.item"><span selectItemText [class]="styles['item-text']">{{ item.label }}</span><span *selectItemIndicator [class]="styles['item-indicator']">✓</span></div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
        </div>
        <pre fixtureOutput [values]="{ value: value(), open: open(), reason: reason() }"></pre>
    `,
})
export class SelectGroups {
    protected readonly styles = select;
    protected readonly fruits = FRUITS;
    protected readonly vegetables = VEGETABLES;
    protected readonly value = signal<string | null>("carrot");
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);

    protected onOpenChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
        this.reason.set(event.details.reason);
    }
}
