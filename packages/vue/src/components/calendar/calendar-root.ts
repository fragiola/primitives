import type { PlainDate } from "@fragiola/primitives/date";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type CalendarRootSharedProps,
    type CalendarRootState,
    defineCalendarRoot,
} from "./calendar-root-base.ts";

export interface CalendarRootProps extends CalendarRootSharedProps {
    value?: PlainDate | null;
    defaultValue?: PlainDate | null;
}

export type CalendarRootEmits = {
    "update:value": (value: PlainDate | null) => true;
    valueChange: (value: PlainDate | null, details: ChangeDetails) => true;
};

/**
 * One date (spec/calendar.md, `v-model:value`). Inside a DatePicker with no value of its own, it
 * binds to it.
 */
export const CalendarRoot: PartComponent<
    CalendarRootProps,
    CalendarRootState,
    CalendarRootEmits
> = publicComponent(defineCalendarRoot("CalendarRoot", "calendar", "single"));
