import { Component, computed, signal } from "@angular/core";
import {
    SearchFieldClearButton,
    SearchFieldInput,
    SearchFieldRoot,
} from "@fragiola/primitives-angular/search-field";
import { styles } from "./styles.ts";

const PRODUCTS = ["Desk lamp", "Floor lamp", "Standing desk", "Desk chair"];

// A product search (spec/search-field.md): typing filters the list, Escape or the clear button
// empties the field (the button is out of the tab order: Escape clears from the keyboard), and
// Enter searches for the query.
@Component({
    selector: "example-product-search",
    imports: [SearchFieldRoot, SearchFieldInput, SearchFieldClearButton],
    template: `
        <search [class]="styles.stack">
            <label for="product-search" [class]="styles.label">Search products</label>
            <div searchFieldRoot [id]="'product-search'" [(value)]="query" (valueSubmit)="searched.set('Searched for “' + $event + '”.')" [class]="styles.root">
                <svg [class]="styles.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-4-4" />
                </svg>
                <input searchFieldInput placeholder="Lamps, desks…" [class]="styles.input" />
                <button searchFieldClearButton aria-label="Clear search" [class]="styles.clearButton">
                    <svg [class]="styles.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>
            </div>
            <ul aria-label="Results" [class]="styles.list">
                @for (name of matches(); track name) {
                    <li>{{ name }}</li>
                }
            </ul>
            <p role="status" [class]="styles.status">{{ searched() }}</p>
        </search>
    `,
})
export default class ProductSearch {
    protected readonly styles = styles;
    protected readonly query = signal("");
    protected readonly searched = signal("");
    protected readonly matches = computed(() =>
        PRODUCTS.filter((name) =>
            name.toLowerCase().includes(this.query().trim().toLowerCase()),
        ),
    );
}
