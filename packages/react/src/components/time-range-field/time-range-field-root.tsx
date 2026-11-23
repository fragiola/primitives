import type { SegmentGranularity } from "@fragiola/primitives/segments";
import type { PlainTime, TimeRange } from "@fragiola/primitives/time";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    DateRangeFieldRootBase,
    type DateRangeFieldRootSharedProps,
    type FieldRange,
} from "../date-range-field/date-range-field-root-base.tsx";

export interface TimeRangeFieldRootProps extends DateRangeFieldRootSharedProps {
    /** `{ start, end }` of `PlainTime`s; `null` while a segment of either end is a placeholder. */
    value?: TimeRange | null;
    defaultValue?: TimeRange | null;
    onValueChange?: (value: TimeRange | null, details: ChangeDetails) => void;
    /** `hour`, `minute` (the default) or `second`. */
    granularity?: Exclude<SegmentGranularity, "day">;
    /** What a placeholder segment's first step gives; default: midnight. */
    placeholderValue?: PlainTime;
    /** Times before it are invalid. */
    min?: PlainTime;
    /** Times after it are invalid. */
    max?: PlainTime;
}

const MIDNIGHT: PlainTime = { hour: 0, minute: 0, second: 0, millisecond: 0 };

/** A start and an end time of day typed in segments (spec/date-range-field.md, TimeRangeField). */
export function TimeRangeFieldRoot({
    value,
    defaultValue = null,
    onValueChange,
    granularity = "minute",
    placeholderValue = MIDNIGHT,
    min,
    max,
    ...props
}: TimeRangeFieldRootProps) {
    return (
        <DateRangeFieldRootBase<PlainTime>
            {...props}
            component="time-range-field"
            kind="time"
            granularity={granularity}
            value={value}
            defaultValue={defaultValue}
            onValueChange={
                onValueChange as
                    | ((
                          value: FieldRange<PlainTime> | null,
                          details: ChangeDetails,
                      ) => void)
                    | undefined
            }
            placeholderValue={placeholderValue}
            min={min}
            max={max}
        />
    );
}
