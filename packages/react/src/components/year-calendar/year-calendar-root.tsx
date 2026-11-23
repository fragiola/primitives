import type { PlainYear } from "@fragiola/primitives/month-year";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    MonthCalendarRootBase,
    type MonthCalendarRootSharedProps,
} from "../month-calendar/month-calendar-root-base.tsx";
import type { MonthCalendarValue } from "../month-calendar/month-calendar-value.ts";

export interface YearCalendarRootProps extends MonthCalendarRootSharedProps {
    value?: PlainYear | null;
    defaultValue?: PlainYear | null;
    onValueChange?: (value: PlainYear | null, details: ChangeDetails) => void;
    /** Years before it are disabled. */
    min?: PlainYear | null;
    /** Years after it are disabled. */
    max?: PlainYear | null;
    /** Unavailable years can be focused but not chosen. */
    isUnavailable?: (year: PlainYear) => boolean;
}

/** One year, in a grid of a page of 12 years (spec/month-calendar.md), on the MonthCalendar's state and parts. */
export function YearCalendarRoot(props: YearCalendarRootProps) {
    return (
        <MonthCalendarRootBase
            component="year-calendar"
            kind="year"
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
