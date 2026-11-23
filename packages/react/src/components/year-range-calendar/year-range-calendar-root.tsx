import type { PlainYear, YearRange } from "@fragiola/primitives/month-year";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    MonthCalendarRootBase,
    type MonthCalendarRootSharedProps,
} from "../month-calendar/month-calendar-root-base.tsx";
import type { MonthCalendarValue } from "../month-calendar/month-calendar-value.ts";

export interface YearRangeCalendarRootProps
    extends MonthCalendarRootSharedProps {
    value?: YearRange | null;
    defaultValue?: YearRange | null;
    onValueChange?: (value: YearRange | null, details: ChangeDetails) => void;
    /** Years before it are disabled. */
    min?: PlainYear | null;
    /** Years after it are disabled. */
    max?: PlainYear | null;
    /** Unavailable years can be focused but not chosen. */
    isUnavailable?: (year: PlainYear) => boolean;
}

/** A range of years (spec/month-calendar.md), on the MonthCalendar's state and parts. */
export function YearRangeCalendarRoot(props: YearRangeCalendarRootProps) {
    return (
        <MonthCalendarRootBase
            component="year-range-calendar"
            kind="year"
            mode="range"
            {...props}
            onValueChange={
                props.onValueChange as
                    | ((
                          value: MonthCalendarValue,
                          details: ChangeDetails,
                      ) => void)
                    | undefined
            }
        />
    );
}
