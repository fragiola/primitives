import type { PlainYear, YearRange } from "@fragiola/primitives/month-year";
import type { ChangeDetails } from "../../utils/change-details.ts";
import type { MonthCalendarValue } from "../month-calendar/month-calendar-value.ts";
import {
    MonthPickerRootBase,
    type MonthPickerRootSharedProps,
} from "../month-picker/month-picker-root-base.tsx";

export interface YearRangePickerRootProps extends MonthPickerRootSharedProps {
    value?: YearRange | null;
    defaultValue?: YearRange | null;
    onValueChange?: (value: YearRange | null, details: ChangeDetails) => void;
    /** Years before it are disabled (passed to the bound calendar). */
    min?: PlainYear | null;
    /** Years after it are disabled (passed to the bound calendar). */
    max?: PlainYear | null;
    /** Unavailable years can be focused but not chosen (passed to the bound calendar). */
    isUnavailable?: (year: PlainYear) => boolean;
}

/** A trigger and a popup holding a bound `YearRangeCalendar.Root`: a range of years (spec/month-calendar.md). */
export function YearRangePickerRoot(props: YearRangePickerRootProps) {
    return (
        <MonthPickerRootBase
            component="year-range-picker"
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
