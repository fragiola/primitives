import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { OpenChangeEvent } from "@fragiola/primitives-angular/select";
import { select } from "examples-shared/recipes/select";
import { Output } from "../../kit/output.ts";
import { FRUIT_ITEMS } from "./fruit-items.ts";
import { SELECT_PARTS } from "./select-parts.ts";

/** spec/select.md, `/select/modal`: scroll lock and a blocked outside pointer while open. */
@Component({
    selector: "[scenario-select-modal]",
    encapsulation: ViewEncapsulation.None,
    imports: [SELECT_PARTS, Output],
    template: `
        <div class="h-[200vh]">
            <div class="flex items-end gap-2">
                <div class="flex flex-col items-start gap-2">
                    <label for="fruit" class="text-sm font-medium">Fruit</label>
                    <ng-container selectRoot modal [items]="items" (valueChange)="value.set($event)" (openChangeDetails)="onOpenChange($event)">
                        <button selectTrigger id="fruit" [class]="styles.trigger"><span selectValue placeholder="Choose a fruit" [class]="styles.value"></span></button>
                        <ng-container *selectPortal>
                            <div selectPositioner [class]="styles.positioner">
                                <div selectPopup [class]="styles.popup">
                                    <div selectList [class]="styles.list">
                                        @for (item of items; track item.value) {
                                            <div selectItem [value]="item.value" [class]="styles.item">{{ item.label }}<span *selectItemIndicator [class]="styles['item-indicator']">✓</span></div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </ng-container>
                    </ng-container>
                </div>
                <button type="button" (click)="outside.set('pressed')">Outside button</button>
            </div>
            <pre fixtureOutput [values]="{ value: value(), open: open(), reason: reason(), outside: outside() }"></pre>
        </div>
    `,
})
export class SelectModal {
    protected readonly styles = select;
    protected readonly items = FRUIT_ITEMS;
    protected readonly value = signal<string | null>(null);
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly outside = signal<string | undefined>(undefined);

    protected onOpenChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
        this.reason.set(event.details.reason);
    }
}
