import { Directive, inject, input, signal } from "@angular/core";
import { labelId } from "@fragiola/primitives-angular/internal";
import { ListboxGroup } from "./listbox-group.directive.ts";

/** Names its Group (spec/listbox.md): `<div listboxGroupLabel>`. */
@Directive({
    selector: "[listboxGroupLabel]",
    exportAs: "listboxGroupLabel",
    host: {
        "data-primitives-part": "listbox-group-label",
        "[attr.id]": "resolvedId()",
    },
})
export class ListboxGroupLabel {
    readonly id = input<string | undefined>(undefined);
    protected readonly resolvedId = labelId(
        this.id,
        inject(ListboxGroup, { optional: true })?.labelId ?? signal(undefined),
        "primitives-listbox-group-label",
    );
}
