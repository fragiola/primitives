import type {
    PlainYearMonth,
    YearMonthRange,
} from "@fragiola/primitives/month-year";
import type {
    ChangeDetails,
    OpenChangeDetails,
} from "../../utils/change-details.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    defineMonthPickerRoot,
    type MonthPickerRootSharedProps,
} from "../month-picker/month-picker-root-base.ts";

export interface MonthRangePickerRootProps extends MonthPickerRootSharedProps {
    value?: YearMonthRange | null;
    defaultValue?: YearMonthRange | null;
    /** Months before it are disabled (passed to the bound calendar). */
    min?: PlainYearMonth | null;
    /** Months after it are disabled (passed to the bound calendar). */
    max?: PlainYearMonth | null;
    /** Unavailable months can be focused but not chosen (passed to the bound calendar). */
    isUnavailable?: (item: PlainYearMonth) => boolean;
}

export type MonthRangePickerRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: OpenChangeDetails) => true;
    openChangeComplete: (open: boolean) => true;
    "update:value": (value: YearMonthRange | null) => true;
    valueChange: (value: YearMonthRange | null, details: ChangeDetails) => true;
};

/** A trigger and a popup holding a bound `MonthRangeCalendar.Root`: a range of months (spec/month-calendar.md). */
export const MonthRangePickerRoot: PublicComponent<
    MonthRangePickerRootProps,
    ContentSlots,
    MonthRangePickerRootEmits
> = publicComponent(
    defineMonthPickerRoot(
        "MonthRangePickerRoot",
        "month-range-picker",
        "month",
        "range",
    ),
);
