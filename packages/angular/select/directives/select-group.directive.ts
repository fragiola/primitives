import { Directive, signal } from "@angular/core";

/** A `group` of items, named by its GroupLabel (spec/select.md): `<div selectGroup>`. */
@Directive({
    selector: "[selectGroup]",
    exportAs: "selectGroup",
    host: {
        role: "group",
        "data-primitives-part": "select-group",
        "[attr.aria-labelledby]": "labelId() ?? null",
    },
})
export class SelectGroup {
    readonly labelId = signal<string | undefined>(undefined);
}
