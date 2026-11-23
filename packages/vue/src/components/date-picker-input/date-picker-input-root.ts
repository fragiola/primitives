import type {
    ChangeDetails,
    OpenChangeDetails,
} from "../../utils/change-details.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import type { DateFieldValue } from "../date-field/date-field-root.ts";
import {
    type DatePickerInputRootSharedProps,
    defineDatePickerInputRoot,
} from "./date-picker-input-root-base.ts";

export interface DatePickerInputRootProps
    extends DatePickerInputRootSharedProps {
    /** A `PlainDate` (`day`) or a `PlainDateTime`; set only from a complete, valid entry (`v-model:value`). */
    value?: DateFieldValue | null;
    defaultValue?: DateFieldValue | null;
}

export type DatePickerInputRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: OpenChangeDetails) => true;
    openChangeComplete: (open: boolean) => true;
    "update:value": (value: DateFieldValue | null) => true;
    valueChange: (value: DateFieldValue | null, details: ChangeDetails) => true;
};

/**
 * A DatePicker whose date is also typed into segments (spec/calendar.md, "Typed input"): its
 * Trigger, Portal, Positioner and Popup are the DatePicker's, its Segments and Segment DateField's.
 */
export const DatePickerInputRoot: PublicComponent<
    DatePickerInputRootProps,
    ContentSlots,
    DatePickerInputRootEmits
> = publicComponent(
    defineDatePickerInputRoot("DatePickerInputRoot", "date-picker", "single"),
);
