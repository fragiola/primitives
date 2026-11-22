import { Directive } from "@angular/core";
import { injectId } from "@fragiola/primitives-angular/internal";

/** A `group` of items, named by its GroupLabel (spec/combobox.md): `<div comboboxGroup>`. */
@Directive({
    selector: "[comboboxGroup]",
    exportAs: "comboboxGroup",
    host: {
        role: "group",
        "data-primitives-part": "combobox-group",
        "[attr.aria-labelledby]": "labelId",
    },
})
export class ComboboxGroup {
    /** Its GroupLabel's id. */
    readonly labelId = `${injectId("primitives-combobox-group")}-label`;
}
