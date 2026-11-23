import { Directive, inject } from "@angular/core";
import { writeFieldAria } from "@fragiola/primitives-angular/field";
import { registerHost } from "@fragiola/primitives-angular/internal";
import { DATE_FIELD } from "../utils/date-field-state.ts";

/**
 * The `group` of the segments (spec/date-field.md, "Anatomy"), named by the Field's label, else the
 * consumer's (`aria-label`): `<div dateFieldInput #input="dateFieldInput">`. A directive renders no
 * template, so the consumer renders the segments: `@for (segment of input.segments(); track
 * segment.index) { <span [dateFieldSegment]="segment">{{ segment.text }}</span> }`.
 */
@Directive({
    selector: "[dateFieldInput]",
    exportAs: "dateFieldInput",
    host: {
        role: "group",
        "[attr.data-primitives-part]": "dateField.part('input')",
        "[attr.data-disabled]": "dateField.data().disabled",
        "[attr.data-readonly]": "dateField.data().readonly",
        "[attr.data-required]": "dateField.data().required",
        "[attr.data-invalid]": "dateField.data().invalid",
        "[attr.data-valid]": "dateField.data().valid",
        "[attr.data-dirty]": "dateField.data().dirty",
        "[attr.data-touched]": "dateField.data().touched",
        "[attr.data-filled]": "dateField.data().filled",
        "[attr.data-focused]": "dateField.data().focused",
    },
})
export class DateFieldInput {
    protected readonly dateField = inject(DATE_FIELD);
    /** The segments to render, in the locale's order (the toolkit's `DateSegment`). */
    readonly segments = this.dateField.segments;
    /** The field's state. */
    readonly state = this.dateField.state;

    constructor() {
        const host = registerHost(this.dateField.inputElement);
        const { field } = this.dateField;
        writeFieldAria(field, host, {
            "aria-labelledby": field.labelledBy,
            "aria-describedby": field.describedBy,
        });
    }
}
