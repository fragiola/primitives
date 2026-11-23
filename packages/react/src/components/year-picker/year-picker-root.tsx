import type { PlainYear } from "@fragiola/primitives/month-year";
import type { ChangeDetails } from "../../utils/change-details.ts";
import type { MonthCalendarValue } from "../month-calendar/month-calendar-value.ts";
import {
    MonthPickerRootBase,
    type MonthPickerRootSharedProps,
} from "../month-picker/month-picker-root-base.tsx";

export interface YearPickerRootProps extends MonthPickerRootSharedProps {
    value?: PlainYear | null;
    defaultValue?: PlainYear | null;
    onValueChange?: (value: PlainYear | null, details: ChangeDetails) => void;
    /** Years before it are disabled (passed to the bound calendar). */
    min?: PlainYear | null;
    /** Years after it are disabled (passed to the bound calendar). */
    max?: PlainYear | null;
    /** Unavailable years can be focused but not chosen (passed to the bound calendar). */
    isUnavailable?: (year: PlainYear) => boolean;
}

/** A trigger and a popup holding a bound `YearCalendar.Root`: one year (spec/month-calendar.md). */
export function YearPickerRoot(props: YearPickerRootProps) {
    return (
        <MonthPickerRootBase
            component="year-picker"
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
