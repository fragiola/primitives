import type { ChangeDetails } from "../../utils/change-details.ts";
import type { DateFieldValue } from "../date-field/date-field-root.tsx";
import {
    DatePickerInputRootBase,
    type DatePickerInputRootSharedProps,
} from "./date-picker-input-root-base.tsx";

export interface DatePickerInputRootProps
    extends DatePickerInputRootSharedProps {
    /** A `PlainDate` (`day`) or a `PlainDateTime`; set only from a complete, valid entry. */
    value?: DateFieldValue | null;
    defaultValue?: DateFieldValue | null;
    onValueChange?: (
        value: DateFieldValue | null,
        details: ChangeDetails,
    ) => void;
}

/**
 * A DatePicker whose date is also typed into segments (spec/calendar.md, "Typed input"): its
 * Trigger, Portal, Positioner and Popup are the DatePicker's, its Segments and Segment DateField's.
 */
export function DatePickerInputRoot(props: DatePickerInputRootProps) {
    return (
        <DatePickerInputRootBase
            component="date-picker"
            mode="single"
            {...props}
            onValueChange={
                props.onValueChange as
                    | ((value: unknown, details: ChangeDetails) => void)
                    | undefined
            }
        />
    );
}
