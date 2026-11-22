import type { DateRange } from "@fragiola/primitives/date";
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
    type DatePickerRootSharedProps,
    defineDatePickerRoot,
} from "../date-picker/date-picker-root-base.ts";

export interface DateRangePickerRootProps extends DatePickerRootSharedProps {
    value?: DateRange | null;
    defaultValue?: DateRange | null;
}

export type DateRangePickerRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: OpenChangeDetails) => true;
    openChangeComplete: (open: boolean) => true;
    "update:value": (value: DateRange | null) => true;
    valueChange: (value: DateRange | null, details: ChangeDetails) => true;
};

/** A trigger and a popup holding a bound `RangeCalendar.Root` (spec/calendar.md). */
export const DateRangePickerRoot: PublicComponent<
    DateRangePickerRootProps,
    ContentSlots,
    DateRangePickerRootEmits
> = publicComponent(
    defineDatePickerRoot("DateRangePickerRoot", "date-range-picker", "range"),
);
