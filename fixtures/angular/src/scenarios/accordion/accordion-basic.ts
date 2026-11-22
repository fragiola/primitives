import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    AccordionRoot,
    AccordionTrigger,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/accordion";
import { accordion } from "examples-shared/recipes/accordion";
import { Output } from "../../kit/output.ts";
import { ITEM_TEMPLATE, ITEMS, type Item } from "./accordion-items.ts";

const BASIC: Item[] = [
    ITEMS[0],
    ITEMS[1],
    { value: "warranty", label: "Warranty", disabled: true },
    ITEMS[2],
].filter((item) => item !== undefined);

/** spec/accordion.md, `/accordion/basic` */
@Component({
    selector: "[scenario-accordion-basic]",
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
        <div accordionRoot (valueChangeDetails)="changed($event)" [class]="styles.root">${ITEM_TEMPLATE}</div>
        <button type="button" class="mt-2">After accordion</button>
        <pre fixtureOutput [values]="{ value: value(), reason: reason() }"></pre>
    `,
})
export class AccordionBasic {
    protected readonly styles = accordion;
    protected readonly items = BASIC;
    protected readonly hiddenUntilFound = false;
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);

    protected changed(event: ValueChangeEvent<string[]>): void {
        this.value.set(event.value.join(","));
        this.reason.set(event.details.reason);
    }
}
