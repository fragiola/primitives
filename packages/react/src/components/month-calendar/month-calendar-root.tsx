import type { PlainYearMonth } from "@fragiola/primitives/month-year";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    MonthCalendarRootBase,
    type MonthCalendarRootSharedProps,
} from "./month-calendar-root-base.tsx";
import type { MonthCalendarValue } from "./month-calendar-value.ts";

export interface MonthCalendarRootProps extends MonthCalendarRootSharedProps {
    value?: PlainYearMonth | null;
    defaultValue?: PlainYearMonth | null;
    onValueChange?: (
        value: PlainYearMonth | null,
        details: ChangeDetails,
    ) => void;
    /** Months before it are disabled. */
    min?: PlainYearMonth | null;
    /** Months after it are disabled. */
    max?: PlainYearMonth | null;
    /** Unavailable months can be focused but not chosen. */
    isUnavailable?: (month: PlainYearMonth) => boolean;
}

/**
 * One month (spec/month-calendar.md). Inside a MonthPicker, or a calendar's month view, with no
 * value of its own, it binds to it.
 */
export function MonthCalendarRoot(props: MonthCalendarRootProps) {
    return (
        <MonthCalendarRootBase
            component="month-calendar"
            kind="month"
            mode="single"
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
