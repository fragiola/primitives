import { Directive, signal } from "@angular/core";

/** A `group` of items, named by its GroupLabel (spec/listbox.md): `<div listboxGroup>`. */
@Directive({
    selector: "[listboxGroup]",
    exportAs: "listboxGroup",
    host: {
        role: "group",
        "data-primitives-part": "listbox-group",
        "[attr.aria-labelledby]": "labelId() ?? null",
    },
})
export class ListboxGroup {
    readonly labelId = signal<string | undefined>(undefined);
}
