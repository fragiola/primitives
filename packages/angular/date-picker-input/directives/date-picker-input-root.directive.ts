import {
    computed,
    Directive,
    forwardRef,
    inject,
    input,
    output,
} from "@angular/core";
import { today } from "@fragiola/primitives/date";
import type { SegmentGranularity } from "@fragiola/primitives/segments";
import { PICKER_BINDING } from "@fragiola/primitives-angular/calendar";
import {
    DATE_FIELD,
    type DateFieldValue,
} from "@fragiola/primitives-angular/date-field";
import {
    DATE_PICKER,
    DatePickerRootBase,
} from "@fragiola/primitives-angular/date-picker";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/internal";
import {
    DatePickerInputState,
    type PickerValue,
} from "../utils/date-picker-input-state.ts";

/** `hourCycle="24"` and `[hourCycle]="24"` give `24`; nothing gives `undefined`. */
export function hourCycleAttribute(value: unknown): 12 | 24 | undefined {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }
    return Number(value) === 12 ? 12 : 24;
}

/**
 * A DatePicker whose date is also typed into segments (spec/calendar.md, "Typed input"):
 * `<ng-container datePickerInputRoot [(value)]="date">` around a `[dateFieldInput]` (its Segments,
 * named `date-picker-segments`) with `[dateFieldSegment]`s, a `[datePickerTrigger]` and the
 * DatePicker's popup parts.
 */
@Directive({
    selector: "[datePickerInputRoot]",
    exportAs: "datePickerInputRoot",
    providers: [
        {
            provide: DATE_PICKER,
            useFactory: () =>
                inject(forwardRef(() => DatePickerInputRoot)).picker,
        },
        {
            provide: PICKER_BINDING,
            useFactory: () =>
                inject(forwardRef(() => DatePickerInputRoot)).picker.binding,
        },
        {
            provide: DATE_FIELD,
            useFactory: () =>
                inject(forwardRef(() => DatePickerInputRoot)).typed.group(
                    "start",
                ),
        },
    ],
})
export class DatePickerInputRoot extends DatePickerRootBase {
    /** A `PlainDate` (`day`) or a `PlainDateTime`; set only from a complete, valid entry. */
    readonly value = input<DateFieldValue | null | undefined>(undefined);
    readonly valueChange = output<DateFieldValue | null>();
    readonly defaultValue = input<DateFieldValue | null | undefined>(undefined);
    readonly valueChangeDetails =
        output<ValueChangeEvent<DateFieldValue | null>>();
    /** `day` (the default), or `hour`, `minute`, `second`: the time is typed, the calendar chooses the date. */
    readonly granularity = input<SegmentGranularity>("day");
    /** What a placeholder segment's first step gives, and a placeholder time a chosen date takes; default: today at midnight. */
    readonly placeholderValue = input<DateFieldValue | undefined>(undefined);
    /** `12` or `24`; default: the locale's. */
    readonly hourCycle = input<12 | 24 | undefined, unknown>(undefined, {
        transform: hourCycleAttribute,
    });
    // today, read once when the picker is made (as the calendars' today)
    private readonly todayDate = today();
    /** The picker's and the segments' state. */
    readonly typed = new DatePickerInputState(
        "date-picker",
        "single",
        {
            open: this.open,
            openChange: this.openChange,
            defaultOpen: this.defaultOpen,
            openChangeComplete: this.openChangeComplete,
            value: this.value,
            valueChange: {
                emit: (value) =>
                    this.valueChange.emit(value as DateFieldValue | null),
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
        },
        (event) => this.openChangeDetails.emit(event),
        (value: PickerValue, details) =>
            this.valueChangeDetails.emit({
                value: value as DateFieldValue | null,
                details,
            }),
    );
    readonly picker = this.typed.picker;
}
