import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    AutocompleteInput,
    AutocompleteInputGroup,
    AutocompleteItem,
    AutocompletePopup,
    AutocompletePortal,
    AutocompletePositioner,
    AutocompleteRoot,
    AutocompleteVirtualList,
    AutocompleteVirtualRow,
} from "@fragiola/primitives-angular/autocomplete-virtual";
import { autocomplete } from "examples-shared/recipes/autocomplete";
import { Output } from "../../kit/output.ts";
import { LABELS } from "./items.ts";
import { asLabel, SCROLL } from "./virtual-lists-parts.ts";

let count = 0;

/** An Autocomplete over the 10 000 labels, with an AutocompleteVirtual List (spec/virtual-lists.md). */
@Component({
    selector: "[scenario-autocomplete-virtual-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        AutocompleteRoot,
        AutocompleteInputGroup,
        AutocompleteInput,
        AutocompletePortal,
        AutocompletePositioner,
        AutocompletePopup,
        AutocompleteVirtualList,
        AutocompleteVirtualRow,
        AutocompleteItem,
        Output,
    ],
    template: `
        <ng-container autocompleteRoot [items]="items" [value]="value()" (valueChange)="value.set($event)">
            <div class="flex flex-col gap-1">
                <label [attr.for]="id" class="text-sm font-medium">Search</label>
                <div autocompleteInputGroup [class]="styles['input-group']">
                    <input autocompleteInput [id]="id" [class]="styles.input" />
                </div>
            </div>
            <ng-container *autocompletePortal>
                <div autocompletePositioner [sideOffset]="4" [class]="styles.positioner">
                    <div autocompletePopup [class]="styles.popup">
                        <div autocompleteVirtualList #list="autocompleteVirtualList" [class]="styles.list + ' ' + scroll">@for (row of list.rows(); track row.index) {<div autocompleteItem [autocompleteVirtualRow]="row" [value]="row.item" [class]="styles.item">{{ asLabel(row.item) }}</div>}</div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class AutocompleteVirtualBasic {
    protected readonly asLabel = asLabel;
    protected readonly styles = autocomplete;
    protected readonly scroll = SCROLL;
    protected readonly id = `autocomplete-virtual-basic-${++count}`;
    protected readonly items = LABELS;
    protected readonly value = signal("");
}
