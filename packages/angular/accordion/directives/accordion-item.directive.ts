import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
} from "@angular/core";
import {
    type ChangeReason,
    dataValues,
} from "@fragiola/primitives-angular/internal";
import {
    type AccordionOrientation,
    AccordionRoot,
} from "./accordion-root.directive.ts";

export interface AccordionItemState {
    open: boolean;
    disabled: boolean;
    orientation: AccordionOrientation;
}

/** `data-open` / `data-closed` (exactly one) and `data-disabled` (spec/accordion.md). */
export function itemAttributes(state: AccordionItemState) {
    return dataValues({
        open: state.open,
        closed: !state.open,
        disabled: state.disabled,
    });
}

/** One section, its Header and its Panel (spec/accordion.md): `<div accordionItem value="faq">`. */
@Directive({
    selector: "[accordionItem]",
    exportAs: "accordionItem",
    host: {
        "data-primitives-part": "accordion-item",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-orientation]": "state().orientation",
    },
})
export class AccordionItem {
    private readonly root = inject(AccordionRoot);
    readonly value = input.required<string>();
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly state = computed<AccordionItemState>(() => {
        const root = this.root.state();
        return {
            open: root.value.includes(this.value()),
            disabled: root.disabled || this.disabled(),
            orientation: root.orientation,
        };
    });
    protected readonly data = computed(() => itemAttributes(this.state()));
    readonly triggerId = computed(() => this.root.triggerId(this.value()));
    readonly panelId = computed(() => this.root.panelId(this.value()));

    setOpen(open: boolean, reason: ChangeReason): void {
        this.root.toggle(this.value(), open, reason);
    }
}
