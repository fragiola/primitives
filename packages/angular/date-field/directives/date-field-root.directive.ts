import {
    computed,
    Directive,
    forwardRef,
    inject,
    input,
    output,
} from "@angular/core";
import { type PlainDate, today } from "@fragiola/primitives/date";
import type { SegmentGranularity } from "@fragiola/primitives/segments";
import type { PlainDateTime } from "@fragiola/primitives/time";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";
import { DATE_FIELD, DateFieldRootState } from "../utils/date-field-state.ts";
import { DateFieldRootBase } from "./date-field-root-base.ts";

/** A DateField's value: a date, or a date and time with a time granularity. */
export type DateFieldValue = PlainDate | PlainDateTime;

/**
 * A date (and, with a time granularity, a time) typed in segments, each an APG spinbutton
 * (spec/date-field.md): `<div dateFieldRoot [(value)]="date">` around a `[dateFieldInput]`, its
 * hidden form input rendered right after it.
 */
@Directive({
    selector: "[dateFieldRoot]",
    exportAs: "dateFieldRoot",
    providers: [
        {
            provide: DATE_FIELD,
            useFactory: () => inject(forwardRef(() => DateFieldRoot)).dateField,
        },
    ],
})
export class DateFieldRoot extends DateFieldRootBase {
    /** A `PlainDate` (`day`) or a `PlainDateTime`; `null` while a segment is a placeholder. */
    readonly value = input<DateFieldValue | null | undefined>(undefined);
    readonly valueChange = output<DateFieldValue | null>();
    readonly defaultValue = input<DateFieldValue | null>(null);
    readonly valueChangeDetails =
        output<ValueChangeEvent<DateFieldValue | null>>();
    /** `day` (the default), or `hour`, `minute`, `second` for a date and time. */
    readonly granularity = input<SegmentGranularity>("day");
    /** What a placeholder segment's first step gives; default: today at midnight. */
    readonly placeholderValue = input<DateFieldValue | undefined>(undefined);
    /** Values before it are invalid (a `PlainDate` counts as its midnight). */
    readonly min = input<DateFieldValue | null | undefined>(undefined);
    /** Values after it are invalid. */
    readonly max = input<DateFieldValue | null | undefined>(undefined);
    /** An unavailable date is invalid. */
    readonly isDateUnavailable = input<
        ((date: PlainDate) => boolean) | undefined
    >(undefined);
    // today, read once when the field is made (as the calendars' today)
    private readonly todayDate = today();
    readonly dateField = new DateFieldRootState(
        "date-field",
        "date",
        this.stateInputs({
            value: this.value,
            valueChange: {
                emit: (value) =>
                    this.valueChange.emit(value as DateFieldValue | null),
            },
            defaultValue: this.defaultValue,
            granularity: this.granularity,
            placeholderValue: computed(
                () => this.placeholderValue() ?? this.todayDate,
            ),
            min: this.min,
            max: this.max,
            isDateUnavailable: this.isDateUnavailable,
        }),
        (value, details) =>
            this.valueChangeDetails.emit({
                value: value as DateFieldValue | null,
                details,
            }),
        this.host,
    );
}
