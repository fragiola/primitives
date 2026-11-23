import type { PlainYear } from "@fragiola/primitives/month-year";
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

export interface YearPickerRootProps extends MonthPickerRootSharedProps {
    value?: PlainYear | null;
    defaultValue?: PlainYear | null;
    /** Years before it are disabled (passed to the bound calendar). */
    min?: PlainYear | null;
    /** Years after it are disabled (passed to the bound calendar). */
    max?: PlainYear | null;
    /** Unavailable years can be focused but not chosen (passed to the bound calendar). */
    isUnavailable?: (item: PlainYear) => boolean;
}

export type YearPickerRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: OpenChangeDetails) => true;
    openChangeComplete: (open: boolean) => true;
    "update:value": (value: PlainYear | null) => true;
    valueChange: (value: PlainYear | null, details: ChangeDetails) => true;
};

/** A trigger and a popup holding a bound `YearCalendar.Root`: one year (spec/month-calendar.md). */
export const YearPickerRoot: PublicComponent<
    YearPickerRootProps,
    ContentSlots,
    YearPickerRootEmits
> = publicComponent(
    defineMonthPickerRoot("YearPickerRoot", "year-picker", "year", "single"),
);
