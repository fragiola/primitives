import { type PlainDate, today } from "@fragiola/primitives/date";
import type { SegmentGranularity } from "@fragiola/primitives/segments";
import type { PlainDateTime } from "@fragiola/primitives/time";
import { useState } from "react";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    DateFieldRootBase,
    type DateFieldRootSharedProps,
    type DateFieldSystemProps,
} from "./date-field-root-base.tsx";

/** A DateField's value: a date, or a date and time with a time granularity. */
export type DateFieldValue = PlainDate | PlainDateTime;

export interface DateFieldRootProps
    extends DateFieldRootSharedProps,
        DateFieldSystemProps {
    /** A `PlainDate` (`day`) or a `PlainDateTime`; `null` while a segment is a placeholder. */
    value?: DateFieldValue | null;
    defaultValue?: DateFieldValue | null;
    onValueChange?: (
        value: DateFieldValue | null,
        details: ChangeDetails,
    ) => void;
    /** `day` (the default), or `hour`, `minute`, `second` for a date and time. */
    granularity?: SegmentGranularity;
    /** What a placeholder segment's first step gives; default: today at midnight. */
    placeholderValue?: DateFieldValue;
    /** Values before it are invalid (a `PlainDate` counts as its midnight). */
    min?: DateFieldValue;
    /** Values after it are invalid. */
    max?: DateFieldValue;
    /** An unavailable date is invalid. */
    isDateUnavailable?: (date: PlainDate) => boolean;
}

/** A date (and, with a time granularity, a time) typed in segments (spec/date-field.md). */
export function DateFieldRoot({
    value,
    defaultValue = null,
    onValueChange,
    granularity = "day",
    placeholderValue,
    min,
    max,
    isDateUnavailable,
    ...props
}: DateFieldRootProps) {
    // today, read once when the field renders (as the calendars' today)
    const [todayDate] = useState(() => today());
    return (
        <DateFieldRootBase<DateFieldValue>
            {...props}
            component="date-field"
            kind="date"
            granularity={granularity}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            placeholderValue={placeholderValue ?? todayDate}
            min={min}
            max={max}
            isDateUnavailable={isDateUnavailable}
        />
    );
}
