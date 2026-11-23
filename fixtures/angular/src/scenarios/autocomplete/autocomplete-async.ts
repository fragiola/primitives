import {
    Component,
    DestroyRef,
    effect,
    inject,
    signal,
    untracked,
    ViewEncapsulation,
} from "@angular/core";
import { autocomplete } from "examples-shared/recipes/autocomplete";
import { Output } from "../../kit/output.ts";
import { AUTOCOMPLETE_PARTS } from "./autocomplete-parts.ts";
import { CITY_POPUP } from "./fruit-popup.ts";
import { asCities, CITIES } from "./suggestions.ts";

let count = 0;

/** Suggestions loaded 300 ms after each change of the text (spec/autocomplete.md). */
@Component({
    selector: "[scenario-autocomplete-async]",
    encapsulation: ViewEncapsulation.None,
    imports: [AUTOCOMPLETE_PARTS, Output],
    template: `
        <ng-container autocompleteRoot [items]="items()" [filter]="null" [(value)]="value">
            <div class="flex flex-col gap-1">
                <label [attr.for]="id" class="text-sm font-medium">City</label>
                <div autocompleteInputGroup [class]="styles['input-group']">
                    <input autocompleteInput [id]="id" [class]="styles.input" />
                </div>
                <div autocompleteStatus [class]="styles.status">{{ loading() ? "Loading…" : "" }}</div>
            </div>
            ${CITY_POPUP}
        </ng-container>
        <pre fixtureOutput [values]="{ value: value(), loaded: loaded() }"></pre>
    `,
})
export class AutocompleteAsync {
    protected readonly asCities = asCities;
    protected readonly styles = autocomplete;
    protected readonly id = `autocomplete-async-${++count}`;
    protected readonly value = signal("");
    protected readonly items = signal<readonly string[]>([]);
    protected readonly loading = signal(false);
    protected readonly loaded = signal<string | undefined>(undefined);

    constructor() {
        let timer: ReturnType<typeof setTimeout> | undefined;
        effect(() => {
            const value = this.value();
            untracked(() => {
                clearTimeout(timer);
                if (value === "") {
                    this.items.set([]);
                    this.loading.set(false);
                    return;
                }
                this.loading.set(true);
                const query = value.trim().toLowerCase();
                timer = setTimeout(() => {
                    this.items.set(
                        CITIES.filter((city) =>
                            city.toLowerCase().includes(query),
                        ),
                    );
                    this.loading.set(false);
                    this.loaded.set(value);
                }, 300);
            });
        });
        inject(DestroyRef).onDestroy(() => clearTimeout(timer));
    }
}
