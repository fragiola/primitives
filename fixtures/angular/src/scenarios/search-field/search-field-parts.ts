import {
    SearchFieldClearButton,
    SearchFieldInput,
    SearchFieldRoot,
} from "@fragiola/primitives-angular/search-field";
import { searchField } from "examples-shared/recipes/search-field";

/** Every SearchField directive, for a scenario's `imports`. */
export const SEARCH_FIELD_PARTS = [
    SearchFieldRoot,
    SearchFieldInput,
    SearchFieldClearButton,
] as const;

/** The search icon React's kit puts first in the Root. */
export const SEARCH_ICON = `<svg class="${searchField.icon}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>`;

/** The styled ClearButton, with its cross icon (React's kit). */
export function clearButton(label: string): string {
    return `<button searchFieldClearButton aria-label="${label}" class="${searchField["clear-button"]}"><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>`;
}
