import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    AccordionRoot,
    AccordionTrigger,
} from "@fragiola/primitives-angular/accordion";
import { accordion } from "examples-shared/recipes/accordion";
import { Output } from "../../kit/output.ts";
import { ITEM_TEMPLATE, ITEMS } from "./accordion-items.ts";

/** spec/accordion.md, `/accordion/multiple`: the fixture holds the value. */
@Component({
    selector: "[scenario-accordion-multiple]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        AccordionRoot,
        AccordionItem,
        AccordionHeader,
        AccordionTrigger,
        AccordionPanel,
        Output,
    ],
    template: `
        <div accordionRoot [multiple]="true" [(value)]="value" (valueChangeDetails)="reason.set($event.details.reason)" [class]="styles.root">${ITEM_TEMPLATE}</div>
        <pre fixtureOutput [values]="{ value: value().join(','), reason: reason() }"></pre>
    `,
})
export class AccordionMultiple {
    protected readonly styles = accordion;
    protected readonly items = ITEMS;
    protected readonly hiddenUntilFound = true;
    protected readonly value = signal(["shipping"]);
    protected readonly reason = signal<string | undefined>(undefined);
}
