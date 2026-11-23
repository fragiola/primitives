import {
    computed,
    Directive,
    forwardRef,
    inject,
    input,
    output,
} from "@angular/core";
import type { SegmentGranularity } from "@fragiola/primitives/segments";
import type { PlainTime, TimeRange } from "@fragiola/primitives/time";
import {
    DATE_RANGE_FIELD,
    DateRangeFieldRootBase,
    DateRangeFieldRootState,
} from "@fragiola/primitives-angular/date-range-field";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";

const MIDNIGHT: PlainTime = { hour: 0, minute: 0, second: 0, millisecond: 0 };

/**
 * A start and an end time of day typed in segments (spec/date-range-field.md, TimeRangeField):
 * `<div timeRangeFieldRoot [(value)]="hours">` around two `[dateRangeFieldInput]`s (the
 * DateRangeField's parts, named `time-range-field-*` inside it), its two hidden form inputs
 * rendered right after it.
 */
@Directive({
    selector: "[timeRangeFieldRoot]",
    exportAs: "timeRangeFieldRoot",
    providers: [
        {
            provide: DATE_RANGE_FIELD,
            useFactory: () =>
                inject(forwardRef(() => TimeRangeFieldRoot)).rangeField,
        },
    ],
})
export class TimeRangeFieldRoot extends DateRangeFieldRootBase {
    /** `{ start, end }` of `PlainTime`s; `null` while a segment of either end is a placeholder. */
    readonly value = input<TimeRange | null | undefined>(undefined);
    readonly valueChange = output<TimeRange | null>();
    readonly defaultValue = input<TimeRange | null>(null);
    readonly valueChangeDetails = output<ValueChangeEvent<TimeRange | null>>();
    /** `hour`, `minute` (the default) or `second`. */
    readonly granularity = input<Exclude<SegmentGranularity, "day">>("minute");
    /** What a placeholder segment's first step gives; default: midnight. */
    readonly placeholderValue = input<PlainTime>(MIDNIGHT);
    /** Times before it are invalid. */
    readonly min = input<PlainTime | null | undefined>(undefined);
    /** Times after it are invalid. */
    readonly max = input<PlainTime | null | undefined>(undefined);
    readonly rangeField = new DateRangeFieldRootState(
        "time-range-field",
        "time",
        this.stateInputs({
            value: this.value,
            valueChange: {
                emit: (value) =>
                    this.valueChange.emit(value as TimeRange | null),
            },
            defaultValue: this.defaultValue,
            granularity: this.granularity,
            placeholderValue: this.placeholderValue,
            min: this.min,
            max: this.max,
            isDateUnavailable: computed(() => undefined),
        }),
        (value, details) =>
            this.valueChangeDetails.emit({
                value: value as TimeRange | null,
                details,
            }),
        this.host,
    );
}
