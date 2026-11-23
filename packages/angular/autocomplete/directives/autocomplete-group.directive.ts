import { Directive } from "@angular/core";
import { injectId } from "@fragiola/primitives-angular/internal";

/** A `group` of suggestions, named by its GroupLabel: `<div autocompleteGroup>`. */
@Directive({
    selector: "[autocompleteGroup]",
    exportAs: "autocompleteGroup",
    host: {
        role: "group",
        "data-primitives-part": "autocomplete-group",
        "[attr.aria-labelledby]": "labelId",
    },
})
export class AutocompleteGroup {
    /** Its GroupLabel's id. */
    readonly labelId = `${injectId("primitives-autocomplete-group")}-label`;
}
