import { Component, input, ViewEncapsulation } from "@angular/core";
import { select } from "examples-shared/recipes/select";
import { Lifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.ts";
import { FRUIT_ITEMS } from "./fruit-items.ts";
import { SELECT_PARTS } from "./select-parts.ts";

/** spec/README.md, "The lifecycle scenarios". */
@Component({
    selector: "[scenario-select-lifecycle]",
    encapsulation: ViewEncapsulation.None,
    imports: [SELECT_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-2">
            <label for="fruit" class="text-sm font-medium">Fruit</label>
            <ng-container selectRoot [items]="items" (openChangeDetails)="lifecycle.onOpenChange($event)" (openChangeComplete)="lifecycle.onOpenChangeComplete($event)">
                <button selectTrigger id="fruit" [class]="styles.trigger"><span selectValue placeholder="Choose a fruit" [class]="styles.value"></span></button>
                <ng-container *selectPortal="{ keepMounted: true }">
                    <div selectPositioner [class]="styles.positioner">
                        <div selectPopup [class]="styles.popup">
                            <div selectList [class]="styles.list">
                                @for (item of items; track item.value) {
                                    <div selectItem [value]="item.value" [class]="styles.item">{{ item.label }}</div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
        </div>
        <pre fixtureOutput [values]="lifecycle.values()"></pre>
    `,
})
export class SelectLifecycle {
    protected readonly styles = select;
    protected readonly items = FRUIT_ITEMS;
    readonly cancel = input(false);
    protected readonly lifecycle = new Lifecycle(() => this.cancel());
}
