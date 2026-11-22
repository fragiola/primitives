import { computed, inject } from "@angular/core";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { CALENDAR } from "../utils/calendar-state.ts";

/** What the Prev and Next buttons share: they page by the visible months (spec/calendar.md). */
export function pageButton(delta: 1 | -1) {
    const calendar = inject(CALENDAR);
    const disabled = computed(
        () => calendar.disabled() || !calendar.canPage(delta),
    );
    return {
        part: calendar.part(delta < 0 ? "prev-button" : "next-button"),
        disabled,
        data: computed(() => dataValues({ disabled: disabled() })),
        controls: computed(() =>
            Array.from({ length: calendar.visibleMonths() }, (_, offset) =>
                calendar.gridId(offset),
            ).join(" "),
        ),
        press: () => calendar.page(delta),
    };
}
