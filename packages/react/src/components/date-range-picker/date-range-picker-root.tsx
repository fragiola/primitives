import type { DateRange } from "@fragiola/primitives/date";
import type { ChangeDetails } from "../../utils/change-details.ts";
import type { CalendarValue } from "../calendar/calendar-value.ts";
import {
    DatePickerRootBase,
    type DatePickerRootSharedProps,
} from "../date-picker/date-picker-root-base.tsx";

export interface DateRangePickerRootProps extends DatePickerRootSharedProps {
    value?: DateRange | null;
    defaultValue?: DateRange | null;
    onValueChange?: (value: DateRange | null, details: ChangeDetails) => void;
}

/** A trigger and a popup holding a bound `RangeCalendar.Root` (spec/calendar.md). */
export function DateRangePickerRoot(props: DateRangePickerRootProps) {
    return (
        <DatePickerRootBase
            component="date-range-picker"
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
