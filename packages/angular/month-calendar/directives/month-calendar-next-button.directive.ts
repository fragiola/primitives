import { computed, Directive } from "@angular/core";
import { monthPageButton } from "./month-calendar-page-button.ts";

export interface MonthCalendarNextButtonState {
    disabled: boolean;
}

/** Shows the next page (a year; 12 years); the consumer names it: `<button monthCalendarNextButton>`. */
@Directive({
    selector: "[monthCalendarNextButton]",
    exportAs: "monthCalendarNextButton",
    host: {
        type: "button",
        "[attr.data-primitives-part]": "button.part",
        "[attr.disabled]": "button.data().disabled",
        "[attr.data-disabled]": "button.data().disabled",
        "[attr.aria-controls]": "button.controls",
        "(click)": "button.press()",
    },
})
export class MonthCalendarNextButton {
    protected readonly button = monthPageButton(1);
    readonly state = computed<MonthCalendarNextButtonState>(() => ({
        disabled: this.button.disabled(),
    }));
}
