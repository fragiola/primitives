import { Component, signal, ViewEncapsulation } from "@angular/core";
import { autocomplete } from "examples-shared/recipes/autocomplete";
import { Output } from "../../kit/output.ts";
import { AUTOCOMPLETE_PARTS } from "./autocomplete-parts.ts";
import { asGroups, PRODUCE } from "./suggestions.ts";

let count = 0;

@Component({
    selector: "[scenario-autocomplete-groups]",
    encapsulation: ViewEncapsulation.None,
    imports: [AUTOCOMPLETE_PARTS, Output],
    template: `
        <ng-container autocompleteRoot [items]="produce" [limit]="3" [(value)]="value">
            <div class="flex flex-col gap-1">
                <label [attr.for]="id" class="text-sm font-medium">Produce</label>
                <div autocompleteInputGroup [class]="styles['input-group']">
                    <input autocompleteInput [id]="id" [class]="styles.input" />
                </div>
            </div>
            <ng-container *autocompletePortal>
                <div autocompletePositioner [sideOffset]="4" [class]="styles.positioner">
                    <div autocompletePopup [class]="styles.popup">
                        <div autocompleteEmpty [class]="styles.empty">Nothing found.</div>
                        <div autocompleteList #list="autocompleteList" [class]="styles.list">
                            @for (group of asGroups(list.entries()); track group.label; let index = $index) {
                                @if (index > 0) {
                                    <div autocompleteSeparator [class]="styles.separator"></div>
                                }
                                <div autocompleteGroup [class]="styles.group">
                                    <div autocompleteGroupLabel [class]="styles['group-label']">{{ group.label }}</div>
                                    @for (item of group.items; track item.value) {
                                        <div autocompleteItem [value]="item" [class]="styles.item">{{ item.label }}</div>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class AutocompleteGroups {
    protected readonly asGroups = asGroups;
    protected readonly styles = autocomplete;
    protected readonly id = `autocomplete-groups-${++count}`;
    protected readonly produce = PRODUCE;
    protected readonly value = signal("");
}
