import { Component, ViewEncapsulation } from "@angular/core";
import {
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    AccordionRoot,
    AccordionTrigger,
} from "@fragiola/primitives-angular/accordion";
import { accordion } from "examples-shared/recipes/accordion";
import { ITEM_TEMPLATE, ITEMS } from "./accordion-items.ts";

/** spec/accordion.md, `/accordion/horizontal` (and `?dir=rtl`) */
@Component({
    selector: "[scenario-accordion-horizontal]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        AccordionRoot,
        AccordionItem,
        AccordionHeader,
        AccordionTrigger,
        AccordionPanel,
    ],
    template: `<div accordionRoot orientation="horizontal" [loopFocus]="false" [class]="styles.root">${ITEM_TEMPLATE}</div>`,
})
export class AccordionHorizontal {
    protected readonly styles = accordion;
    protected readonly items = ITEMS;
    protected readonly hiddenUntilFound = false;
}
