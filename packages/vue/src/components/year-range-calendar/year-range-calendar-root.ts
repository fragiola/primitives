import type { PlainYear, YearRange } from "@fragiola/primitives/month-year";
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

export interface YearRangeCalendarRootProps
    extends MonthCalendarRootSharedProps {
    value?: YearRange | null;
    defaultValue?: YearRange | null;
    /** Years before it are disabled. */
    min?: PlainYear | null;
    /** Years after it are disabled. */
    max?: PlainYear | null;
    /** Unavailable years can be focused but not chosen. */
    isUnavailable?: (item: PlainYear) => boolean;
}

export type YearRangeCalendarRootEmits = {
    "update:value": (value: YearRange | null) => true;
    valueChange: (value: YearRange | null, details: ChangeDetails) => true;
};

/** A range of years (spec/month-calendar.md, `v-model:value`), on the MonthCalendar's state and parts. */
export const YearRangeCalendarRoot: PartComponent<
    YearRangeCalendarRootProps,
    MonthCalendarRootState,
    YearRangeCalendarRootEmits
> = publicComponent(
    defineMonthCalendarRoot(
        "YearRangeCalendarRoot",
        "year-range-calendar",
        "year",
        "range",
    ),
);
