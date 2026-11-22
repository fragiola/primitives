import { computed, Directive } from "@angular/core";
import { pageButton } from "./calendar-page-button.ts";

export interface CalendarPrevButtonState {
    disabled: boolean;
}

/** Shows the previous page of months; the consumer names it: `<button calendarPrevButton>`. */
@Directive({
    selector: "[calendarPrevButton]",
    exportAs: "calendarPrevButton",
    host: {
        type: "button",
        "[attr.data-primitives-part]": "button.part",
        "[attr.disabled]": "button.data().disabled",
        "[attr.data-disabled]": "button.data().disabled",
        "[attr.aria-controls]": "button.controls()",
        "(click)": "button.press()",
    },
})
export class CalendarPrevButton {
    protected readonly button = pageButton(-1);
    readonly state = computed<CalendarPrevButtonState>(() => ({
        disabled: this.button.disabled(),
    }));
}
