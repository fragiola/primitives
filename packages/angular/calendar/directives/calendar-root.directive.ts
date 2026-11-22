import { Directive, forwardRef, inject, input, output } from "@angular/core";
import type { PlainDate } from "@fragiola/primitives/date";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";
import { CALENDAR, CalendarState } from "../utils/calendar-state.ts";
import type { CalendarValue } from "../utils/calendar-value.ts";
import { CalendarRootBase } from "./calendar-root-base.ts";

/**
 * One date (spec/calendar.md): `<div calendarRoot [(value)]="date">`. Inside a DatePicker with no
 * value of its own, it binds to it.
 */
@Directive({
    selector: "[calendarRoot]",
    exportAs: "calendarRoot",
    providers: [
        {
            provide: CALENDAR,
            useFactory: () => inject(forwardRef(() => CalendarRoot)).calendar,
        },
    ],
})
export class CalendarRoot extends CalendarRootBase {
    readonly value = input<PlainDate | null | undefined>(undefined);
    readonly valueChange = output<PlainDate | null>();
    readonly defaultValue = input<PlainDate | null | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<PlainDate | null>>();
    readonly calendar = new CalendarState(
        "calendar",
        "single",
        this.stateInputs(
            this.value,
            {
                emit: (value: CalendarValue) =>
                    this.valueChange.emit(value as PlainDate | null),
            },
            this.defaultValue,
        ),
        (value, details) =>
            this.valueChangeDetails.emit({
                value: value as PlainDate | null,
                details,
            }),
    );
}
