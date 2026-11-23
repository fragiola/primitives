import { Component, signal } from "@angular/core";
import {
    AutocompleteClear,
    AutocompleteEmpty,
    AutocompleteInput,
    AutocompleteInputGroup,
    AutocompleteItem,
    AutocompleteList,
    AutocompletePopup,
    AutocompletePortal,
    AutocompletePositioner,
    AutocompleteRoot,
} from "@fragiola/primitives-angular/autocomplete";
import { styles } from "./styles.ts";

const FRAMEWORKS = [
    "Angular",
    "Astro",
    "Ember",
    "Lit",
    "Next.js",
    "Nuxt",
    "Preact",
    "Qwik",
    "React",
    "Remix",
    "Solid",
    "Svelte",
    "Vue",
];

// A search with suggestions: the list follows the text, the arrows highlight a suggestion, Enter
// or a click fills it in, any other text is searched as typed, and Escape closes the list, then
// clears the text (spec/autocomplete.md).
@Component({
    selector: "example-search-suggestions",
    imports: [
        AutocompleteRoot,
        AutocompleteInputGroup,
        AutocompleteInput,
        AutocompleteClear,
        AutocompletePortal,
        AutocompletePositioner,
        AutocompletePopup,
        AutocompleteEmpty,
        AutocompleteList,
        AutocompleteItem,
    ],
    template: `
        <form [class]="styles.stack" (submit)="search($event)">
            <label for="search" [class]="styles.label">Search frameworks</label>
            <ng-container autocompleteRoot [items]="frameworks" name="q">
                <div autocompleteInputGroup [class]="styles.inputGroup">
                    <input autocompleteInput id="search" [class]="styles.input" />
                    <button *autocompleteClear aria-label="Clear search" [class]="styles.clear">×</button>
                </div>
                <ng-container *autocompletePortal>
                    <div autocompletePositioner [sideOffset]="4" [class]="styles.positioner">
                        <div autocompletePopup [class]="styles.popup">
                            <div autocompleteEmpty [class]="styles.empty">No suggestion.</div>
                            <div autocompleteList #list="autocompleteList" [class]="styles.list">
                                @for (name of asNames(list.entries()); track name) {
                                    <div autocompleteItem [value]="name" [class]="styles.item">{{ name }}</div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
            <p [class]="styles.result">{{ searched() === undefined ? "Press Enter to search." : "Results for “" + searched() + "”" }}</p>
        </form>
    `,
})
export default class SearchSuggestions {
    protected readonly styles = styles;
    protected readonly frameworks = FRAMEWORKS;
    protected readonly searched = signal<string | undefined>(undefined);

    /** The List's entries, as names: its API types an entry as `unknown`. */
    protected asNames(entries: readonly unknown[]): readonly string[] {
        return entries as readonly string[];
    }

    protected search(event: SubmitEvent): void {
        event.preventDefault();
        const data = new FormData(event.currentTarget as HTMLFormElement);
        this.searched.set(String(data.get("q") ?? ""));
    }
}
