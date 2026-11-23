import { Component, signal, ViewEncapsulation } from "@angular/core";
import { injectAsyncList } from "@fragiola/primitives-angular/async-list";
import {
    AutocompleteInput,
    AutocompleteInputGroup,
    AutocompleteItem,
    AutocompletePopup,
    AutocompletePortal,
    AutocompletePositioner,
    AutocompleteRoot,
    AutocompleteStatus,
    AutocompleteVirtualList,
    AutocompleteVirtualRow,
} from "@fragiola/primitives-angular/autocomplete-virtual";
import { autocomplete } from "examples-shared/recipes/autocomplete";
import { Output } from "../../kit/output.ts";
import { loadLabels } from "./items.ts";
import { asLabel, SCROLL } from "./virtual-lists-parts.ts";

let count = 0;

/** An Autocomplete whose suggestions load for its text, page by page (spec/virtual-lists.md). */
@Component({
    selector: "[scenario-autocomplete-virtual-async]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        AutocompleteRoot,
        AutocompleteInputGroup,
        AutocompleteInput,
        AutocompleteStatus,
        AutocompletePortal,
        AutocompletePositioner,
        AutocompletePopup,
        AutocompleteVirtualList,
        AutocompleteVirtualRow,
        AutocompleteItem,
        Output,
    ],
    template: `
        <ng-container autocompleteRoot [items]="list.items()" [filter]="null" [value]="value()" (valueChange)="change($event)">
            <div class="flex flex-col gap-1">
                <label [attr.for]="id" class="text-sm font-medium">Search</label>
                <div autocompleteInputGroup [class]="styles['input-group']">
                    <input autocompleteInput [id]="id" [class]="styles.input" />
                </div>
                <div autocompleteStatus [class]="styles.status">{{ list.loading() ? "Loading…" : "" }}</div>
            </div>
            <ng-container *autocompletePortal>
                <div autocompletePositioner [sideOffset]="4" [class]="styles.positioner">
                    <div autocompletePopup [class]="styles.popup">
                        <div autocompleteVirtualList #virtual="autocompleteVirtualList" [loading]="list.loading()" (loadMore)="list.loadMore()" [class]="styles.list + ' ' + scroll">@for (row of virtual.rows(); track row.index) {<div autocompleteItem [autocompleteVirtualRow]="row" [value]="row.item" [class]="styles.item">{{ asLabel(row.item) }}</div>}</div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ count: list.items().length, filter: list.loading() ? undefined : list.filterText(), value: value() }"></pre>
    `,
})
export class AutocompleteVirtualAsync {
    protected readonly asLabel = asLabel;
    protected readonly styles = autocomplete;
    protected readonly scroll = SCROLL;
    protected readonly id = `autocomplete-virtual-async-${++count}`;
    protected readonly list = injectAsyncList({ load: loadLabels });
    protected readonly value = signal("");

    protected change(next: string): void {
        this.value.set(next);
        this.list.setFilterText(next);
    }
}
