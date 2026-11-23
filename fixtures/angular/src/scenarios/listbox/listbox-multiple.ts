import { Component, ViewEncapsulation } from "@angular/core";
import { Output } from "../../kit/output.ts";
import { LISTBOX_PARTS } from "./listbox-parts.ts";
import { TOPPINGS_TEMPLATE, ToppingsListbox } from "./toppings-listbox.ts";

@Component({
    selector: "[scenario-listbox-multiple]",
    encapsulation: ViewEncapsulation.None,
    imports: [LISTBOX_PARTS, Output],
    template: TOPPINGS_TEMPLATE,
})
export class ListboxMultiple extends ToppingsListbox {
    protected readonly selectionBehavior = "toggle";
}
