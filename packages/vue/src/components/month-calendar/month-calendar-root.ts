import type { PlainYearMonth } from "@fragiola/primitives/month-year";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    defineMonthCalendarRoot,
    type MonthCalendarRootSharedProps,
    type MonthCalendarRootState,
} from "./month-calendar-root-base.ts";

export interface MonthCalendarRootProps extends MonthCalendarRootSharedProps {
    value?: PlainYearMonth | null;
    defaultValue?: PlainYearMonth | null;
    /** Months before it are disabled. */
    min?: PlainYearMonth | null;
    /** Months after it are disabled. */
    max?: PlainYearMonth | null;
    /** Unavailable months can be focused but not chosen. */
    isUnavailable?: (month: PlainYearMonth) => boolean;
}

export type MonthCalendarRootEmits = {
    "update:value": (value: PlainYearMonth | null) => true;
    valueChange: (value: PlainYearMonth | null, details: ChangeDetails) => true;
};

/**
 * One month (spec/month-calendar.md, `v-model:value`). Inside a MonthPicker, or a calendar's month
 * view, with no value of its own, it binds to it.
 */
export const MonthCalendarRoot: PartComponent<
    MonthCalendarRootProps,
    MonthCalendarRootState,
    MonthCalendarRootEmits
> = publicComponent(
    defineMonthCalendarRoot(
        "MonthCalendarRoot",
        "month-calendar",
        "month",
        "single",
    ),
);
