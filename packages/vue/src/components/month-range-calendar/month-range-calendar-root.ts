import type {
    PlainYearMonth,
    YearMonthRange,
} from "@fragiola/primitives/month-year";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    defineMonthCalendarRoot,
    type MonthCalendarRootSharedProps,
    type MonthCalendarRootState,
} from "../month-calendar/month-calendar-root-base.ts";

export interface MonthRangeCalendarRootProps
    extends MonthCalendarRootSharedProps {
    value?: YearMonthRange | null;
    defaultValue?: YearMonthRange | null;
    /** Months before it are disabled. */
    min?: PlainYearMonth | null;
    /** Months after it are disabled. */
    max?: PlainYearMonth | null;
    /** Unavailable months can be focused but not chosen. */
    isUnavailable?: (item: PlainYearMonth) => boolean;
}

export type MonthRangeCalendarRootEmits = {
    "update:value": (value: YearMonthRange | null) => true;
    valueChange: (value: YearMonthRange | null, details: ChangeDetails) => true;
};

/** A range of months (spec/month-calendar.md, `v-model:value`), on the MonthCalendar's state and parts. */
export const MonthRangeCalendarRoot: PartComponent<
    MonthRangeCalendarRootProps,
    MonthCalendarRootState,
    MonthRangeCalendarRootEmits
> = publicComponent(
    defineMonthCalendarRoot(
        "MonthRangeCalendarRoot",
        "month-range-calendar",
        "month",
        "range",
    ),
);
