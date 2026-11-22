import { Directive, inject, input, signal } from "@angular/core";
import { labelId } from "@fragiola/primitives-angular/internal";
import { SelectGroup } from "./select-group.directive.ts";

/** Names its Group (spec/select.md): `<div selectGroupLabel>`. */
@Directive({
    selector: "[selectGroupLabel]",
    exportAs: "selectGroupLabel",
    host: {
        "data-primitives-part": "select-group-label",
        "[attr.id]": "resolvedId()",
    },
})
export class SelectGroupLabel {
    readonly id = input<string | undefined>(undefined);
    protected readonly resolvedId = labelId(
        this.id,
        inject(SelectGroup, { optional: true })?.labelId ?? signal(undefined),
        "primitives-select-group-label",
    );
}
