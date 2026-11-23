import { Directive, inject, input } from "@angular/core";
import { labelId } from "@fragiola/primitives-angular/internal";
import { MeterRoot } from "./meter-root.directive.ts";

/** Names the meter (`aria-labelledby`, spec/meter.md): `<span meterLabel>Battery</span>`. */
@Directive({
    selector: "[meterLabel]",
    exportAs: "meterLabel",
    host: {
        "data-primitives-part": "meter-label",
        "[attr.id]": "resolvedId()",
    },
})
export class MeterLabel {
    readonly id = input<string | undefined>(undefined);
    private readonly root = inject(MeterRoot);
    readonly state = this.root.state;
    protected readonly resolvedId = labelId(
        this.id,
        this.root.labelId,
        "primitives-meter-label",
    );
}
