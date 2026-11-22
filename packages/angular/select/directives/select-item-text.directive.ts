import { Directive } from "@angular/core";

/** The text of an Item that is its label (spec/select.md): `<span selectItemText>`. */
@Directive({
    selector: "[selectItemText]",
    host: { "data-primitives-part": "select-item-text" },
})
export class SelectItemText {}
