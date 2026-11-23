import type { PlainYear, YearRange } from "@fragiola/primitives/month-year";
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

export interface YearRangePickerRootProps extends MonthPickerRootSharedProps {
    value?: YearRange | null;
    defaultValue?: YearRange | null;
    /** Years before it are disabled (passed to the bound calendar). */
    min?: PlainYear | null;
    /** Years after it are disabled (passed to the bound calendar). */
    max?: PlainYear | null;
    /** Unavailable years can be focused but not chosen (passed to the bound calendar). */
    isUnavailable?: (item: PlainYear) => boolean;
}

export type YearRangePickerRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: OpenChangeDetails) => true;
    openChangeComplete: (open: boolean) => true;
    "update:value": (value: YearRange | null) => true;
    valueChange: (value: YearRange | null, details: ChangeDetails) => true;
};

/** A trigger and a popup holding a bound `YearRangeCalendar.Root`: a range of years (spec/month-calendar.md). */
export const YearRangePickerRoot: PublicComponent<
    YearRangePickerRootProps,
    ContentSlots,
    YearRangePickerRootEmits
> = publicComponent(
    defineMonthPickerRoot(
        "YearRangePickerRoot",
        "year-range-picker",
        "year",
        "range",
    ),
);
