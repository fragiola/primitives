import { computed, Directive } from "@angular/core";
import { monthPageButton } from "./month-calendar-page-button.ts";

export interface MonthCalendarPrevButtonState {
    disabled: boolean;
}

/** Shows the previous page (a year; 12 years); the consumer names it: `<button monthCalendarPrevButton>`. */
@Directive({
    selector: "[monthCalendarPrevButton]",
    exportAs: "monthCalendarPrevButton",
    host: {
        type: "button",
        "[attr.data-primitives-part]": "button.part",
        "[attr.disabled]": "button.data().disabled",
        "[attr.data-disabled]": "button.data().disabled",
        "[attr.aria-controls]": "button.controls",
        "(click)": "button.press()",
    },
})
export class MonthCalendarPrevButton {
    protected readonly button = monthPageButton(-1);
    readonly state = computed<MonthCalendarPrevButtonState>(() => ({
        disabled: this.button.disabled(),
    }));
}
