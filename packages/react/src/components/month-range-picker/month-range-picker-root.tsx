import type {
    PlainYearMonth,
    YearMonthRange,
} from "@fragiola/primitives/month-year";
import type { ChangeDetails } from "../../utils/change-details.ts";
import type { MonthCalendarValue } from "../month-calendar/month-calendar-value.ts";
import {
    MonthPickerRootBase,
    type MonthPickerRootSharedProps,
} from "../month-picker/month-picker-root-base.tsx";

export interface MonthRangePickerRootProps extends MonthPickerRootSharedProps {
    value?: YearMonthRange | null;
    defaultValue?: YearMonthRange | null;
    onValueChange?: (
        value: YearMonthRange | null,
        details: ChangeDetails,
    ) => void;
    /** Months before it are disabled (passed to the bound calendar). */
    min?: PlainYearMonth | null;
    /** Months after it are disabled (passed to the bound calendar). */
    max?: PlainYearMonth | null;
    /** Unavailable months can be focused but not chosen (passed to the bound calendar). */
    isUnavailable?: (month: PlainYearMonth) => boolean;
}

/** A trigger and a popup holding a bound `MonthRangeCalendar.Root`: a range of months (spec/month-calendar.md). */
export function MonthRangePickerRoot(props: MonthRangePickerRootProps) {
    return (
        <MonthPickerRootBase
            component="month-range-picker"
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
