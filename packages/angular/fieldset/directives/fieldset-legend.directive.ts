import { computed, Directive, input } from "@angular/core";
import {
    dataValue,
    injectEnclosing,
    labelId,
} from "@fragiola/primitives-angular/internal";
import { FieldsetRoot } from "./fieldset-root.directive.ts";

/**
 * Names the Fieldset (its `aria-labelledby`; spec/fieldset.md): a `div`, not a `<legend>`, on the
 * consumer's own element: `<div fieldsetLegend>Shipping address</div>`.
 */
@Directive({
    selector: "[fieldsetLegend]",
    exportAs: "fieldsetLegend",
    host: {
        "data-primitives-part": "fieldset-legend",
        "[attr.id]": "resolvedId()",
        "[attr.data-disabled]": "dataDisabled()",
    },
})
export class FieldsetLegend {
    readonly id = input<string | undefined>(undefined);
    private readonly root = injectEnclosing(
        FieldsetRoot,
        "fieldsetRoot",
        "FieldsetLegend",
    );
    protected readonly resolvedId = labelId(
        this.id,
        this.root.legendId,
        "primitives-fieldset-legend",
    );
    readonly state = this.root.state;
    protected readonly dataDisabled = computed(() =>
        dataValue(this.state().disabled),
    );
}
