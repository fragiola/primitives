import type { DateRange } from "@fragiola/primitives/date";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type CalendarRootSharedProps,
    type CalendarRootState,
    defineCalendarRoot,
} from "../calendar/calendar-root-base.ts";

export interface RangeCalendarRootProps extends CalendarRootSharedProps {
    value?: DateRange | null;
    defaultValue?: DateRange | null;
}

export type RangeCalendarRootEmits = {
    "update:value": (value: DateRange | null) => true;
    valueChange: (value: DateRange | null, details: ChangeDetails) => true;
};

/**
 * A range of dates (spec/calendar.md, `v-model:value`): two choices, swapped when the end comes
 * first. Inside a DateRangePicker with no value of its own, it binds to it.
 */
export const RangeCalendarRoot: PartComponent<
    RangeCalendarRootProps,
    CalendarRootState,
    RangeCalendarRootEmits
> = publicComponent(
    defineCalendarRoot("RangeCalendarRoot", "range-calendar", "range"),
);
