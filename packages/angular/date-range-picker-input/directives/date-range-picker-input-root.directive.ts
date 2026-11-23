import {
    booleanAttribute,
    computed,
    Directive,
    forwardRef,
    inject,
    input,
    output,
} from "@angular/core";
import { today } from "@fragiola/primitives/date";
import type { SegmentGranularity } from "@fragiola/primitives/segments";
import type { Disambiguation, TimeZone } from "@fragiola/primitives/time-zone";
import { PICKER_BINDING } from "@fragiola/primitives-angular/calendar";
import type { DateFieldValue } from "@fragiola/primitives-angular/date-field";
import {
    DATE_PICKER,
    DatePickerRootBase,
} from "@fragiola/primitives-angular/date-picker";
import {
    DatePickerInputState,
    hourCycleAttribute,
    type PickerValue,
} from "@fragiola/primitives-angular/date-picker-input";
import {
    DATE_RANGE_FIELD,
    type DateRangeFieldValue,
} from "@fragiola/primitives-angular/date-range-field";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";

/**
 * A DateRangePicker whose range is also typed into two ends' segments (spec/calendar.md, "Typed
 * input"): `<ng-container dateRangePickerInputRoot [(value)]="range">` around two
 * `[dateRangeFieldInput]`s (its Segments, named `date-range-picker-segments`), a
 * `[datePickerTrigger]` and the DatePicker's popup parts.
 */
@Directive({
    selector: "[dateRangePickerInputRoot]",
    exportAs: "dateRangePickerInputRoot",
    providers: [
        {
            provide: DATE_PICKER,
            useFactory: () =>
                inject(forwardRef(() => DateRangePickerInputRoot)).picker,
        },
        {
            provide: PICKER_BINDING,
            useFactory: () =>
                inject(forwardRef(() => DateRangePickerInputRoot)).picker
                    .binding,
        },
        {
            provide: DATE_RANGE_FIELD,
            useFactory: () =>
                inject(forwardRef(() => DateRangePickerInputRoot)).typed,
        },
    ],
})
export class DateRangePickerInputRoot extends DatePickerRootBase {
    /** `{ start, end }`; set only from a complete, valid entry (the end not before the start). */
    readonly value = input<DateRangeFieldValue | null | undefined>(undefined);
    readonly valueChange = output<DateRangeFieldValue | null>();
    readonly defaultValue = input<DateRangeFieldValue | null | undefined>(
        undefined,
    );
    readonly valueChangeDetails =
        output<ValueChangeEvent<DateRangeFieldValue | null>>();
    /** `day` (the default), or `hour`, `minute`, `second`: the times are typed, the calendar chooses the dates. */
    readonly granularity = input<SegmentGranularity>("day");
    /** What a placeholder segment's first step gives, and a placeholder time a chosen date takes; default: today at midnight. */
    readonly placeholderValue = input<DateFieldValue | undefined>(undefined);
    /** `12` or `24`; default: the locale's. */
    readonly hourCycle = input<12 | 24 | undefined, unknown>(undefined, {
        transform: hourCycleAttribute,
    });
    /**
     * A time zone from `@fragiola/primitives/time-zone` (`timeZone("America/New_York")`): the
     * values are `ZonedDateTime`s in it, and a date and time shows the zone's name.
     */
    readonly timeZone = input<TimeZone | undefined>(undefined);
    /** Hides the zone's name segment. */
    readonly hideTimeZone = input(false, { transform: booleanAttribute });
    /** How a wall time the zone skips or repeats resolves (Temporal's; default `compatible`). */
    readonly disambiguation = input<Disambiguation | undefined>(undefined);
    private readonly todayDate = today();
    /** The picker's and the segments' state. */
    readonly typed = new DatePickerInputState(
        "date-range-picker",
        "range",
        {
            open: this.open,
            openChange: this.openChange,
            defaultOpen: this.defaultOpen,
            openChangeComplete: this.openChangeComplete,
            value: this.value,
            valueChange: {
                emit: (value) =>
                    this.valueChange.emit(value as DateRangeFieldValue | null),
            },
            defaultValue: this.defaultValue,
            options: this.options,
            name: this.name,
            required: this.required,
            disabled: this.disabled,
            readOnly: this.readOnly,
            granularity: this.granularity,
            placeholderValue: computed(
                () => this.placeholderValue() ?? this.todayDate,
            ),
            hourCycle: this.hourCycle,
            system: {
                calendar: this.calendar,
                timeZone: this.timeZone,
                hideTimeZone: this.hideTimeZone,
                disambiguation: this.disambiguation,
            },
        },
        (event) => this.openChangeDetails.emit(event),
        (value: PickerValue, details) =>
            this.valueChangeDetails.emit({
                value: value as DateRangeFieldValue | null,
                details,
            }),
    );
    readonly picker = this.typed.picker;
}
