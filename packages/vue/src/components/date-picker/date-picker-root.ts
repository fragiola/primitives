import type { PlainDate } from "@fragiola/primitives/date";
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
} from "./date-picker-root-base.ts";

export interface DatePickerRootProps extends DatePickerRootSharedProps {
    value?: PlainDate | null;
    defaultValue?: PlainDate | null;
}

export type DatePickerRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: OpenChangeDetails) => true;
    openChangeComplete: (open: boolean) => true;
    "update:value": (value: PlainDate | null) => true;
    valueChange: (value: PlainDate | null, details: ChangeDetails) => true;
};

/** A trigger and a popup holding a bound `Calendar.Root` (spec/calendar.md). */
export const DatePickerRoot: PublicComponent<
    DatePickerRootProps,
    ContentSlots,
    DatePickerRootEmits
> = publicComponent(
    defineDatePickerRoot("DatePickerRoot", "date-picker", "single"),
);
