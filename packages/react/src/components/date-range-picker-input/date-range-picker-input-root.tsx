import type { ChangeDetails } from "../../utils/change-details.ts";
import type { DatePickerInputRootSharedProps } from "../date-picker-input/date-picker-input-root-base.tsx";
import { DatePickerInputRootBase } from "../date-picker-input/date-picker-input-root-base.tsx";
import type { DateRangeFieldValue } from "../date-range-field/date-range-field-root.tsx";

export interface DateRangePickerInputRootProps
    extends DatePickerInputRootSharedProps {
    /** `{ start, end }`; set only from a complete, valid entry (the end not before the start). */
    value?: DateRangeFieldValue | null;
    defaultValue?: DateRangeFieldValue | null;
    onValueChange?: (
        value: DateRangeFieldValue | null,
        details: ChangeDetails,
    ) => void;
}

/**
 * A DateRangePicker whose range is also typed into two ends' segments (spec/calendar.md, "Typed
 * input"): its other parts are the DateRangePicker's, its Segments the range field's Input.
 */
export function DateRangePickerInputRoot(props: DateRangePickerInputRootProps) {
    return (
        <DatePickerInputRootBase
            component="date-range-picker"
            mode="range"
            {...props}
            onValueChange={
                props.onValueChange as
                    | ((value: unknown, details: ChangeDetails) => void)
                    | undefined
            }
        />
    );
}
