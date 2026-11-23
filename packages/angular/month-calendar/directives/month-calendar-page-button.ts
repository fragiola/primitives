import { computed, inject } from "@angular/core";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { MONTH_CALENDAR } from "../utils/month-calendar-state.ts";

/** What the Prev and Next buttons share: they page by a year, or 12 years (spec/month-calendar.md). */
export function monthPageButton(delta: 1 | -1) {
    const calendar = inject(MONTH_CALENDAR);
    const disabled = computed(
        () => calendar.disabled() || !calendar.canPage(delta),
    );
    return {
        part: calendar.part(delta < 0 ? "prev-button" : "next-button"),
        disabled,
        data: computed(() => dataValues({ disabled: disabled() })),
        controls: calendar.gridId(),
        press: () => calendar.page(delta),
    };
}
