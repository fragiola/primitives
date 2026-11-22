import { computed, Directive, inject } from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { DATE_PICKER } from "../utils/date-picker-state.ts";

export interface DatePickerTriggerState {
    open: boolean;
}

/** Opens the picker; its content is the consumer's (the formatted value): `<button datePickerTrigger>`. */
@Directive({
    selector: "[datePickerTrigger]",
    exportAs: "datePickerTrigger",
    host: {
        type: "button",
        "aria-haspopup": "dialog",
        "[attr.data-primitives-part]": "picker.part('trigger')",
        "[attr.id]": "picker.overlay.triggerId",
        "[attr.aria-expanded]": "String(state().open)",
        "[attr.aria-controls]": "state().open ? picker.overlay.popupId : null",
        "[attr.data-popup-open]": "data().open",
        "(click)": "picker.overlay.setOpen(!state().open, 'trigger-press')",
    },
})
export class DatePickerTrigger {
    protected readonly picker = inject(DATE_PICKER);
    readonly state = computed<DatePickerTriggerState>(() =>
        this.picker.state(),
    );
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly String = String;

    constructor() {
        registerHost(this.picker.overlay.trigger);
    }
}
