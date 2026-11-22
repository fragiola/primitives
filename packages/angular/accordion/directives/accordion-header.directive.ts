import { computed, Directive, inject } from "@angular/core";
import { AccordionItem, itemAttributes } from "./accordion-item.directive.ts";

/** The heading around a Trigger (spec/accordion.md): `<h3 accordionHeader>`, another level on another element. */
@Directive({
    selector: "[accordionHeader]",
    exportAs: "accordionHeader",
    host: {
        "data-primitives-part": "accordion-header",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-disabled]": "data().disabled",
    },
})
export class AccordionHeader {
    private readonly item = inject(AccordionItem);
    readonly state = this.item.state;
    protected readonly data = computed(() => itemAttributes(this.state()));
}
