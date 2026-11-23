import { DatePickerInput as Primitive } from "@fragiola/primitives-react/date-picker-input";
import { DateRangePickerInput as RangePrimitive } from "@fragiola/primitives-react/date-range-picker-input";
import { dateField, dateRangeField } from "examples-shared/recipes/date-field";
import { datePickerInput } from "examples-shared/recipes/date-picker";
import type { ComponentProps } from "react";
import { DatePicker } from "./date-picker.tsx";

/** The calendar button beside the segments: an icon's place, named by `aria-label`. */
function CalendarButton({ label }: { label: string }) {
    return (
        <DatePicker.Trigger
            className={datePickerInput.trigger}
            aria-label={label}
        >
            <span aria-hidden="true">▾</span>
        </DatePicker.Trigger>
    );
}

/** A DatePickerInput's segments and its Trigger (spec/calendar.md, "Typed input"). */
export function TypedDate({ trigger }: { trigger: string }) {
    return (
        <div className={datePickerInput.group}>
            <Primitive.Segments className={dateField.input} />
            <CalendarButton label={trigger} />
        </div>
    );
}

/** A DateRangePickerInput's two ends and its Trigger. */
export function TypedRange({
    start,
    end,
    trigger,
}: {
    start: string;
    end: string;
    trigger: string;
}) {
    return (
        <div className={datePickerInput.group}>
            <RangePrimitive.Segments
                className={dateField.input}
                range="start"
                aria-label={start}
            />
            <span aria-hidden="true" className={dateRangeField.separator}>
                –
            </span>
            <RangePrimitive.Segments
                className={dateField.input}
                range="end"
                aria-label={end}
            />
            <CalendarButton label={trigger} />
        </div>
    );
}

export const DatePickerInput = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root {...props} />
    ),
};

export const DateRangePickerInput = {
    Root: (props: ComponentProps<typeof RangePrimitive.Root>) => (
        <RangePrimitive.Root {...props} />
    ),
};
