import { computed, Directive, inject } from "@angular/core";
import { writeFieldAria } from "@fragiola/primitives-angular/field";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { DATE_PICKER } from "../utils/date-picker-state.ts";

export interface DatePickerTriggerState {
    open: boolean;
    disabled: boolean;
    readonly: boolean;
    required: boolean;
}

/**
 * Opens the picker; its content is the consumer's (the formatted value): `<button datePickerTrigger>`.
 * Disabled while the picker is; inside a `[fieldRoot]`, the field's label points at it
 * (spec/field.md, "Integration contract").
 */
@Directive({
    selector: "[datePickerTrigger]",
    exportAs: "datePickerTrigger",
    host: {
        type: "button",
        "aria-haspopup": "dialog",
        "[attr.data-primitives-part]": "picker.part('trigger')",
        "[attr.id]": "picker.overlay.triggerId",
        "[attr.disabled]": "data().disabled",
        "[attr.aria-expanded]": "String(state().open)",
        "[attr.aria-controls]": "state().open ? picker.overlay.popupId : null",
        "[attr.data-invalid]": "picker.field.data().invalid",
        "[attr.data-valid]": "picker.field.data().valid",
        "[attr.data-dirty]": "picker.field.data().dirty",
        "[attr.data-touched]": "picker.field.data().touched",
        "[attr.data-filled]": "picker.field.data().filled",
        "[attr.data-focused]": "picker.field.data().focused",
        "[attr.data-popup-open]": "data().open",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-readonly]": "data().readonly",
        "[attr.data-required]": "data().required",
        "(click)": "onClick($event)",
        "(focus)": "picker.field.focused()",
        "(blur)": "picker.field.blurred()",
    },
})
export class DatePickerTrigger {
    protected readonly picker = inject(DATE_PICKER);
    readonly state = computed<DatePickerTriggerState>(() =>
        this.picker.trigger(),
    );
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly String = String;

    constructor() {
        const host = registerHost(this.picker.overlay.singleTrigger);
        const { field } = this.picker;
        writeFieldAria(field, host, {
            "aria-labelledby": field.labelledBy,
            "aria-describedby": field.describedBy,
            "aria-invalid": field.ariaInvalid,
        });
    }

    protected onClick(event: MouseEvent): void {
        if (this.picker.disabled()) {
            return;
        }
        this.picker.overlay.setOpen(!this.state().open, "trigger-press", event);
    }
}
