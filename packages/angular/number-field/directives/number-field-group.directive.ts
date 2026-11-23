import { Directive, inject } from "@angular/core";
import { NumberFieldRoot } from "./number-field-root.directive.ts";

/** Groups the Input with its buttons (`role="group"`, spec/number-field.md): `<div numberFieldGroup>`. */
@Directive({
    selector: "[numberFieldGroup]",
    exportAs: "numberFieldGroup",
    host: {
        role: "group",
        "data-primitives-part": "number-field-group",
        "[attr.data-disabled]": "root.data().disabled",
        "[attr.data-readonly]": "root.data().readonly",
        "[attr.data-required]": "root.data().required",
        "[attr.data-scrubbing]": "root.data().scrubbing",
        "[attr.data-invalid]": "root.data().invalid",
        "[attr.data-valid]": "root.data().valid",
        "[attr.data-dirty]": "root.data().dirty",
        "[attr.data-touched]": "root.data().touched",
        "[attr.data-filled]": "root.data().filled",
        "[attr.data-focused]": "root.data().focused",
    },
})
export class NumberFieldGroup {
    protected readonly root = inject(NumberFieldRoot);
    readonly state = this.root.state;
}
