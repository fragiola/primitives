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
    type DatePickerInputRootSharedProps,
    defineDatePickerInputRoot,
} from "../date-picker-input/date-picker-input-root-base.ts";
import type { DateRangeFieldValue } from "../date-range-field/date-range-field-root.ts";

export interface DateRangePickerInputRootProps
    extends DatePickerInputRootSharedProps {
    /** `{ start, end }`; set only from a complete, valid entry, the end not before the start (`v-model:value`). */
    value?: DateRangeFieldValue | null;
    defaultValue?: DateRangeFieldValue | null;
}

export type DateRangePickerInputRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: OpenChangeDetails) => true;
    openChangeComplete: (open: boolean) => true;
    "update:value": (value: DateRangeFieldValue | null) => true;
    valueChange: (
        value: DateRangeFieldValue | null,
        details: ChangeDetails,
    ) => true;
};

/**
 * A DateRangePicker whose range is also typed into two ends' segments (spec/calendar.md, "Typed
 * input"): its other parts are the DateRangePicker's, its Segments the range field's Input.
 */
export const DateRangePickerInputRoot: PublicComponent<
    DateRangePickerInputRootProps,
    ContentSlots,
    DateRangePickerInputRootEmits
> = publicComponent(
    defineDatePickerInputRoot(
        "DateRangePickerInputRoot",
        "date-range-picker",
        "range",
    ),
);
