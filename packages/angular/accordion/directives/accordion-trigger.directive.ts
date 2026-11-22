import { computed, Directive, inject } from "@angular/core";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { AccordionItem } from "./accordion-item.directive.ts";

/**
 * A header's button (spec/accordion.md): `<button accordionTrigger>`. Enter and Space toggle its
 * item through its native click.
 */
@Directive({
    selector: "[accordionTrigger]",
    exportAs: "accordionTrigger",
    host: {
        type: "button",
        "data-primitives-part": "accordion-trigger",
        "[attr.id]": "item.triggerId()",
        "[attr.aria-expanded]": "state().open ? 'true' : 'false'",
        "[attr.aria-controls]": "state().open ? item.panelId() : null",
        "[attr.disabled]": "data().disabled",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-panel-open]": "data()['panel-open']",
        "(click)": "onClick()",
    },
})
export class AccordionTrigger {
    protected readonly item = inject(AccordionItem);
    readonly state = this.item.state;
    protected readonly data = computed(() => {
        const { open, disabled } = this.state();
        return dataValues({ disabled, "panel-open": open });
    });

    protected onClick(): void {
        const { open, disabled } = this.state();
        if (!disabled) {
            this.item.setOpen(!open, "trigger-press");
        }
    }
}
