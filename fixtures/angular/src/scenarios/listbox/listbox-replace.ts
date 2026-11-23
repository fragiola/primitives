import { Component, ViewEncapsulation } from "@angular/core";
import { Output } from "../../kit/output.ts";
import { LISTBOX_PARTS } from "./listbox-parts.ts";
import { TOPPINGS_TEMPLATE, ToppingsListbox } from "./toppings-listbox.ts";

@Component({
    selector: "[scenario-listbox-replace]",
    encapsulation: ViewEncapsulation.None,
    imports: [LISTBOX_PARTS, Output],
    template: TOPPINGS_TEMPLATE,
})
export class ListboxReplace extends ToppingsListbox {
    protected readonly selectionBehavior = "replace";
}
