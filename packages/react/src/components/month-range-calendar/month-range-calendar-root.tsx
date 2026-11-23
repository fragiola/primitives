import type {
    PlainYearMonth,
    YearMonthRange,
} from "@fragiola/primitives/month-year";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    MonthCalendarRootBase,
    type MonthCalendarRootSharedProps,
} from "../month-calendar/month-calendar-root-base.tsx";
import type { MonthCalendarValue } from "../month-calendar/month-calendar-value.ts";

export interface MonthRangeCalendarRootProps
    extends MonthCalendarRootSharedProps {
    value?: YearMonthRange | null;
    defaultValue?: YearMonthRange | null;
    onValueChange?: (
        value: YearMonthRange | null,
        details: ChangeDetails,
    ) => void;
    /** Months before it are disabled. */
    min?: PlainYearMonth | null;
    /** Months after it are disabled. */
    max?: PlainYearMonth | null;
    /** Unavailable months can be focused but not chosen. */
    isUnavailable?: (month: PlainYearMonth) => boolean;
}

/** A range of months (spec/month-calendar.md), on the MonthCalendar's state and parts. */
export function MonthRangeCalendarRoot(props: MonthRangeCalendarRootProps) {
    return (
        <MonthCalendarRootBase
            component="month-range-calendar"
            kind="month"
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
