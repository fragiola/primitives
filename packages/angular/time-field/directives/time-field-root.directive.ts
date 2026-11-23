import {
    computed,
    Directive,
    forwardRef,
    inject,
    input,
    output,
} from "@angular/core";
import type { SegmentGranularity } from "@fragiola/primitives/segments";
import type { PlainTime } from "@fragiola/primitives/time";
import {
    DATE_FIELD,
    DateFieldRootBase,
    DateFieldRootState,
} from "@fragiola/primitives-angular/date-field";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";

const MIDNIGHT: PlainTime = { hour: 0, minute: 0, second: 0, millisecond: 0 };

/**
 * A time of day typed in segments (spec/date-field.md, TimeField): `<div timeFieldRoot
 * [(value)]="time">` around a `[dateFieldInput]` (the DateField's parts, named `time-field-*`
 * inside it), its hidden form input rendered right after it.
 */
@Directive({
    selector: "[timeFieldRoot]",
    exportAs: "timeFieldRoot",
    providers: [
        {
            provide: DATE_FIELD,
            useFactory: () => inject(forwardRef(() => TimeFieldRoot)).dateField,
        },
    ],
})
export class TimeFieldRoot extends DateFieldRootBase {
    /** A `PlainTime`; `null` while a segment is a placeholder. */
    readonly value = input<PlainTime | null | undefined>(undefined);
    readonly valueChange = output<PlainTime | null>();
    readonly defaultValue = input<PlainTime | null>(null);
    readonly valueChangeDetails = output<ValueChangeEvent<PlainTime | null>>();
    /** `hour`, `minute` (the default) or `second`. */
    readonly granularity = input<Exclude<SegmentGranularity, "day">>("minute");
    /** What a placeholder segment's first step gives; default: midnight. */
    readonly placeholderValue = input<PlainTime>(MIDNIGHT);
    /** Times before it are invalid. */
    readonly min = input<PlainTime | null | undefined>(undefined);
    /** Times after it are invalid. */
    readonly max = input<PlainTime | null | undefined>(undefined);
    readonly dateField = new DateFieldRootState(
        "time-field",
        "time",
        this.stateInputs({
            value: this.value,
            valueChange: {
                emit: (value) =>
                    this.valueChange.emit(value as PlainTime | null),
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
                value: value as PlainTime | null,
                details,
            }),
        this.host,
    );
}
