import { Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { ComboboxGroup } from "./combobox-group.directive.ts";

/** Names its Group: `<div comboboxGroupLabel>`. */
@Directive({
    selector: "[comboboxGroupLabel]",
    host: {
        "data-primitives-part": "combobox-group-label",
        "[attr.id]": "group.labelId",
    },
})
export class ComboboxGroupLabel {
    protected readonly group = injectEnclosing(
        ComboboxGroup,
        "comboboxGroup",
        "ComboboxGroupLabel",
    );
}
