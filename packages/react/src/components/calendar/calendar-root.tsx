import type { PlainDate } from "@fragiola/primitives/date";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    CalendarRootBase,
    type CalendarRootSharedProps,
} from "./calendar-root-base.tsx";
import type { CalendarValue } from "./calendar-value.ts";

export interface CalendarRootProps extends CalendarRootSharedProps {
    value?: PlainDate | null;
    defaultValue?: PlainDate | null;
    onValueChange?: (value: PlainDate | null, details: ChangeDetails) => void;
}

/** One date (spec/calendar.md). Inside a DatePicker with no value of its own, it binds to it. */
export function CalendarRoot(props: CalendarRootProps) {
    return (
        <CalendarRootBase
            component="calendar"
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
