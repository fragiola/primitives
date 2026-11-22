import type { DateRange } from "@fragiola/primitives/date";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    CalendarRootBase,
    type CalendarRootSharedProps,
} from "../calendar/calendar-root-base.tsx";
import type { CalendarValue } from "../calendar/calendar-value.ts";

export interface RangeCalendarRootProps extends CalendarRootSharedProps {
    value?: DateRange | null;
    defaultValue?: DateRange | null;
    onValueChange?: (value: DateRange | null, details: ChangeDetails) => void;
}

/**
 * A range of dates (spec/calendar.md): two choices, swapped when the end comes first. Inside a
 * DateRangePicker with no value of its own, it binds to it.
 */
export function RangeCalendarRoot(props: RangeCalendarRootProps) {
    return (
        <CalendarRootBase
            component="range-calendar"
            mode="range"
            {...props}
            onValueChange={
                props.onValueChange as
                    | ((value: CalendarValue, details: ChangeDetails) => void)
                    | undefined
            }
        />
    );
}
