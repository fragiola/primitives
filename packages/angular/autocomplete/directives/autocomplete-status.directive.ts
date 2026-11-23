import { Directive } from "@angular/core";

/** A polite live region for the consumer's text (spec/autocomplete.md): `<div autocompleteStatus>`. */
@Directive({
    selector: "[autocompleteStatus]",
    host: {
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true",
        "data-primitives-part": "autocomplete-status",
    },
})
export class AutocompleteStatus {}
