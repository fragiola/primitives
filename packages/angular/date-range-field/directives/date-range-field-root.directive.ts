import {
    booleanAttribute,
    computed,
    Directive,
    forwardRef,
    inject,
    input,
    output,
    type Signal,
} from "@angular/core";
import type { CalendarSystem } from "@fragiola/primitives/calendar-systems";
import {
    type DateRange,
    type PlainDate,
    today,
} from "@fragiola/primitives/date";
import type { SegmentGranularity } from "@fragiola/primitives/segments";
import type { PlainDateTime } from "@fragiola/primitives/time";
import type { Disambiguation, TimeZone } from "@fragiola/primitives/time-zone";
import type { DateFieldValue } from "@fragiola/primitives-angular/date-field";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";
import { DateRangeFieldRootState } from "../utils/date-range-field-state.ts";
import type { FieldRange } from "../utils/field-range.ts";
import { DATE_RANGE_FIELD } from "../utils/range-end-parts.ts";
import { DateRangeFieldRootBase } from "./date-range-field-root-base.ts";

/** A DateRangeField's value: two dates, or two dates and times with a time granularity. */
export type DateRangeFieldValue =
    | DateRange
    | { readonly start: PlainDateTime; readonly end: PlainDateTime };

/**
 * A start and an end date typed in segments (spec/date-range-field.md): `<div dateRangeFieldRoot
 * [(value)]="range">` around two `[dateRangeFieldInput]`s, its two hidden form inputs rendered
 * right after it.
 */
@Directive({
    selector: "[dateRangeFieldRoot]",
    exportAs: "dateRangeFieldRoot",
    providers: [
        {
            provide: DATE_RANGE_FIELD,
            useFactory: () =>
                inject(forwardRef(() => DateRangeFieldRoot)).rangeField,
        },
    ],
})
export class DateRangeFieldRoot extends DateRangeFieldRootBase {
    /** `{ start, end }`; `null` while a segment of either end is a placeholder. */
    readonly value = input<DateRangeFieldValue | null | undefined>(undefined);
    readonly valueChange = output<DateRangeFieldValue | null>();
    readonly defaultValue = input<DateRangeFieldValue | null>(null);
    readonly valueChangeDetails =
        output<ValueChangeEvent<DateRangeFieldValue | null>>();
    /** `day` (the default), or `hour`, `minute`, `second` for dates and times. */
    readonly granularity = input<SegmentGranularity>("day");
    /** What a placeholder segment's first step gives; default: today at midnight. */
    readonly placeholderValue = input<DateFieldValue | undefined>(undefined);
    /** Ends before it are invalid (a `PlainDate` counts as its midnight). */
    readonly min = input<DateFieldValue | null | undefined>(undefined);
    /** Ends after it are invalid. */
    readonly max = input<DateFieldValue | null | undefined>(undefined);
    /** A range whose start or end is unavailable is invalid. */
    readonly isDateUnavailable = input<
        ((date: PlainDate) => boolean) | undefined
    >(undefined);
    /**
     * A calendar system from `@fragiola/primitives/calendar-systems` (spec/calendar-systems.md):
     * the segments show and edit its fields (an era where it has several); values stay ISO.
     */
    readonly calendar = input<CalendarSystem | undefined>(undefined);
    /**
     * A time zone from `@fragiola/primitives/time-zone` (`timeZone("America/New_York")`): the
     * values are `ZonedDateTime`s in it, and a date and time shows the zone's name.
     */
    readonly timeZone = input<TimeZone | undefined>(undefined);
    /** Hides the zone's name segment. */
    readonly hideTimeZone = input(false, { transform: booleanAttribute });
    /** How a wall time the zone skips or repeats resolves (Temporal's; default `compatible`). */
    readonly disambiguation = input<Disambiguation | undefined>(undefined);
    // today, read once when the field is made (as the calendars' today)
    private readonly todayDate = today();
    readonly rangeField = new DateRangeFieldRootState(
        "date-range-field",
        "date",
        this.stateInputs(
            {
                value: this.value as Signal<FieldRange | null | undefined>,
                valueChange: {
                    emit: (value) =>
                        this.valueChange.emit(
                            value as DateRangeFieldValue | null,
                        ),
                },
                defaultValue: this.defaultValue as Signal<FieldRange | null>,
                granularity: this.granularity,
                placeholderValue: computed(
                    () => this.placeholderValue() ?? this.todayDate,
                ),
                min: this.min,
                max: this.max,
                isDateUnavailable: this.isDateUnavailable,
            },
            {
                calendar: this.calendar,
                timeZone: this.timeZone,
                hideTimeZone: this.hideTimeZone,
                disambiguation: this.disambiguation,
            },
        ),
        (value, details) =>
            this.valueChangeDetails.emit({
                value: value as DateRangeFieldValue | null,
                details,
            }),
        this.host,
    );
}
