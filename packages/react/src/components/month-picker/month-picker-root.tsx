import type { PlainYearMonth } from "@fragiola/primitives/month-year";
import type { ChangeDetails } from "../../utils/change-details.ts";
import type { MonthCalendarValue } from "../month-calendar/month-calendar-value.ts";
import {
    MonthPickerRootBase,
    type MonthPickerRootSharedProps,
} from "../month-picker/month-picker-root-base.tsx";

export interface MonthPickerRootProps extends MonthPickerRootSharedProps {
    value?: PlainYearMonth | null;
    defaultValue?: PlainYearMonth | null;
    onValueChange?: (
        value: PlainYearMonth | null,
        details: ChangeDetails,
    ) => void;
    /** Months before it are disabled (passed to the bound calendar). */
    min?: PlainYearMonth | null;
    /** Months after it are disabled (passed to the bound calendar). */
    max?: PlainYearMonth | null;
    /** Unavailable months can be focused but not chosen (passed to the bound calendar). */
    isUnavailable?: (month: PlainYearMonth) => boolean;
}

/** A trigger and a popup holding a bound `MonthCalendar.Root`: one month (spec/month-calendar.md). */
export function MonthPickerRoot(props: MonthPickerRootProps) {
    return (
        <MonthPickerRootBase
            component="month-picker"
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
