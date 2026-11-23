import type { PlainYearMonth } from "@fragiola/primitives/month-year";
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
} from "./month-picker-root-base.ts";

export interface MonthPickerRootProps extends MonthPickerRootSharedProps {
    value?: PlainYearMonth | null;
    defaultValue?: PlainYearMonth | null;
    /** Months before it are disabled (passed to the bound calendar). */
    min?: PlainYearMonth | null;
    /** Months after it are disabled (passed to the bound calendar). */
    max?: PlainYearMonth | null;
    /** Unavailable months can be focused but not chosen (passed to the bound calendar). */
    isUnavailable?: (item: PlainYearMonth) => boolean;
}

export type MonthPickerRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: OpenChangeDetails) => true;
    openChangeComplete: (open: boolean) => true;
    "update:value": (value: PlainYearMonth | null) => true;
    valueChange: (value: PlainYearMonth | null, details: ChangeDetails) => true;
};

/** A trigger and a popup holding a bound `MonthCalendar.Root`: one month (spec/month-calendar.md). */
export const MonthPickerRoot: PublicComponent<
    MonthPickerRootProps,
    ContentSlots,
    MonthPickerRootEmits
> = publicComponent(
    defineMonthPickerRoot("MonthPickerRoot", "month-picker", "month", "single"),
);
