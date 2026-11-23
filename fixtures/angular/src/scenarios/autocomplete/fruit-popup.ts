/**
 * The template pieces the autocomplete scenarios share (React's `FruitPopup` and `CityPopup`),
 * spliced into each scenario's template, as the combobox scenarios do. A scenario using them has
 * `styles` (the `autocomplete` recipe) and the `asFruits` / `asCities` members.
 */

/** The fruits' popup: an Empty (when given) and the List, each Item its label. */
export function fruitPopup(
    empty: string | null = "No suggestion.",
    keepMounted = false,
): string {
    return `
        <ng-container *autocompletePortal="${keepMounted ? "{ keepMounted: true }" : "{}"}">
            <div autocompletePositioner [sideOffset]="4" [class]="styles.positioner">
                <div autocompletePopup [class]="styles.popup">
                    ${empty === null ? "" : `<div autocompleteEmpty [class]="styles.empty">${empty}</div>`}
                    <div autocompleteList #list="autocompleteList" [class]="styles.list">
                        @for (fruit of asFruits(list.entries()); track fruit.value) {
                            <div autocompleteItem [value]="fruit" [disabled]="fruit.disabled ?? false" [class]="styles.item">{{ fruit.label }}</div>
                        }
                    </div>
                </div>
            </div>
        </ng-container>
    `;
}

/** The cities' popup: an Empty "No city found." and the List, each Item a city. */
export const CITY_POPUP = `
    <ng-container *autocompletePortal>
        <div autocompletePositioner [sideOffset]="4" [class]="styles.positioner">
            <div autocompletePopup [class]="styles.popup">
                <div autocompleteEmpty [class]="styles.empty">No city found.</div>
                <div autocompleteList #list="autocompleteList" [class]="styles.list">
                    @for (city of asCities(list.entries()); track city) {
                        <div autocompleteItem [value]="city" [class]="styles.item">{{ city }}</div>
                    }
                </div>
            </div>
        </div>
    </ng-container>
`;
