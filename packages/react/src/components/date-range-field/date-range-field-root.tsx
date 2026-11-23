import {
    type DateRange,
    type PlainDate,
    today,
} from "@fragiola/primitives/date";
import type { SegmentGranularity } from "@fragiola/primitives/segments";
import type { PlainDateTime } from "@fragiola/primitives/time";
import { useState } from "react";
import type { ChangeDetails } from "../../utils/change-details.ts";
import type { DateFieldValue } from "../date-field/date-field-root.tsx";
import {
    DateRangeFieldRootBase,
    type DateRangeFieldRootSharedProps,
    type FieldRange,
} from "./date-range-field-root-base.tsx";

/** A DateRangeField's value: two dates, or two dates and times with a time granularity. */
export type DateRangeFieldValue =
    | DateRange
    | { readonly start: PlainDateTime; readonly end: PlainDateTime };

export interface DateRangeFieldRootProps extends DateRangeFieldRootSharedProps {
    /** `{ start, end }`; `null` while a segment of either end is a placeholder. */
    value?: DateRangeFieldValue | null;
    defaultValue?: DateRangeFieldValue | null;
    onValueChange?: (
        value: DateRangeFieldValue | null,
        details: ChangeDetails,
    ) => void;
    /** `day` (the default), or `hour`, `minute`, `second` for dates and times. */
    granularity?: SegmentGranularity;
    /** What a placeholder segment's first step gives; default: today at midnight. */
    placeholderValue?: DateFieldValue;
    /** Ends before it are invalid (a `PlainDate` counts as its midnight). */
    min?: DateFieldValue;
    /** Ends after it are invalid. */
    max?: DateFieldValue;
    /** A range whose start or end is unavailable is invalid. */
    isDateUnavailable?: (date: PlainDate) => boolean;
}

/** A start and an end date typed in segments (spec/date-range-field.md). */
export function DateRangeFieldRoot({
    value,
    defaultValue = null,
    onValueChange,
    granularity = "day",
    placeholderValue,
    min,
    max,
    isDateUnavailable,
    ...props
}: DateRangeFieldRootProps) {
    // today, read once when the field renders (as the calendars' today)
    const [todayDate] = useState(() => today());
    return (
        <DateRangeFieldRootBase<DateFieldValue>
            {...props}
            component="date-range-field"
            kind="date"
            granularity={granularity}
            value={value as FieldRange<DateFieldValue> | null | undefined}
            defaultValue={defaultValue as FieldRange<DateFieldValue> | null}
            onValueChange={
                onValueChange as
                    | ((
                          value: FieldRange<DateFieldValue> | null,
                          details: ChangeDetails,
                      ) => void)
                    | undefined
            }
            placeholderValue={placeholderValue ?? todayDate}
            min={min}
            max={max}
            isDateUnavailable={isDateUnavailable}
        />
    );
}
