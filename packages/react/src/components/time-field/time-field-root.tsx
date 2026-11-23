import type { SegmentGranularity } from "@fragiola/primitives/segments";
import type { PlainTime } from "@fragiola/primitives/time";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    DateFieldRootBase,
    type DateFieldRootSharedProps,
} from "../date-field/date-field-root-base.tsx";

export interface TimeFieldRootProps extends DateFieldRootSharedProps {
    /** A `PlainTime`; `null` while a segment is a placeholder. */
    value?: PlainTime | null;
    defaultValue?: PlainTime | null;
    onValueChange?: (value: PlainTime | null, details: ChangeDetails) => void;
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

/** A time of day typed in segments (spec/date-field.md, TimeField). */
export function TimeFieldRoot({
    value,
    defaultValue = null,
    onValueChange,
    granularity = "minute",
    placeholderValue = MIDNIGHT,
    min,
    max,
    ...props
}: TimeFieldRootProps) {
    return (
        <DateFieldRootBase<PlainTime>
            {...props}
            component="time-field"
            kind="time"
            granularity={granularity}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            placeholderValue={placeholderValue}
            min={min}
            max={max}
        />
    );
}
