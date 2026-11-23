import type { PlainYear } from "@fragiola/primitives/month-year";
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

export interface YearCalendarRootProps extends MonthCalendarRootSharedProps {
    value?: PlainYear | null;
    defaultValue?: PlainYear | null;
    /** Years before it are disabled. */
    min?: PlainYear | null;
    /** Years after it are disabled. */
    max?: PlainYear | null;
    /** Unavailable years can be focused but not chosen. */
    isUnavailable?: (item: PlainYear) => boolean;
}

export type YearCalendarRootEmits = {
    "update:value": (value: PlainYear | null) => true;
    valueChange: (value: PlainYear | null, details: ChangeDetails) => true;
};

/** One year, in a grid of a page of 12 years (spec/month-calendar.md, `v-model:value`), on the MonthCalendar's state and parts. Inside a YearPicker, or a calendar's year view, with no value of its own, it binds to it. */
export const YearCalendarRoot: PartComponent<
    YearCalendarRootProps,
    MonthCalendarRootState,
    YearCalendarRootEmits
> = publicComponent(
    defineMonthCalendarRoot(
        "YearCalendarRoot",
        "year-calendar",
        "year",
        "single",
    ),
);
