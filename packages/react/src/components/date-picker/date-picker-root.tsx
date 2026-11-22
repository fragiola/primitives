import type { PlainDate } from "@fragiola/primitives/date";
import type { ChangeDetails } from "../../utils/change-details.ts";
import type { CalendarValue } from "../calendar/calendar-value.ts";
import {
    DatePickerRootBase,
    type DatePickerRootSharedProps,
} from "./date-picker-root-base.tsx";

export interface DatePickerRootProps extends DatePickerRootSharedProps {
    value?: PlainDate | null;
    defaultValue?: PlainDate | null;
    onValueChange?: (value: PlainDate | null, details: ChangeDetails) => void;
}

/** A trigger and a popup holding a bound `Calendar.Root` (spec/calendar.md). */
export function DatePickerRoot(props: DatePickerRootProps) {
    return (
        <DatePickerRootBase
            component="date-picker"
            mode="single"
            {...props}
            onValueChange={
                props.onValueChange as
                    | ((value: CalendarValue, details: ChangeDetails) => void)
                    | undefined
            }
        />
    );
}
