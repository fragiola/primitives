import { Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { AutocompleteGroup } from "./autocomplete-group.directive.ts";

/** Names its Group: `<div autocompleteGroupLabel>`. */
@Directive({
    selector: "[autocompleteGroupLabel]",
    host: {
        "data-primitives-part": "autocomplete-group-label",
        "[attr.id]": "group.labelId",
    },
})
export class AutocompleteGroupLabel {
    protected readonly group = injectEnclosing(
        AutocompleteGroup,
        "autocompleteGroup",
        "AutocompleteGroupLabel",
    );
}
