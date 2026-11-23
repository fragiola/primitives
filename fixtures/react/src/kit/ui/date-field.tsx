import { DateField as Primitive } from "@fragiola/primitives-react/date-field";
import { DateRangeField as RangePrimitive } from "@fragiola/primitives-react/date-range-field";
import { TimeField as TimePrimitive } from "@fragiola/primitives-react/time-field";
import { TimeRangeField as TimeRangePrimitive } from "@fragiola/primitives-react/time-range-field";
import { dateField, dateRangeField } from "examples-shared/recipes/date-field";
import type { ComponentProps } from "react";

export const DateField = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={dateField.root} {...props} />
    ),
    Input: (props: ComponentProps<typeof Primitive.Input>) => (
        <Primitive.Input className={dateField.input} {...props} />
    ),
    Segment: (props: ComponentProps<typeof Primitive.Segment>) => (
        <Primitive.Segment className={dateField.segment} {...props} />
    ),
};

export const TimeField = {
    Root: (props: ComponentProps<typeof TimePrimitive.Root>) => (
        <TimePrimitive.Root className={dateField.root} {...props} />
    ),
    Input: DateField.Input,
    Segment: DateField.Segment,
};

const RangeInput = (props: ComponentProps<typeof RangePrimitive.Input>) => (
    <RangePrimitive.Input className={dateField.input} {...props} />
);

/** The two ends side by side, an en dash between them (spec/date-range-field.md, "Scenarios"). */
export function RangeEnds({ start, end }: { start: string; end: string }) {
    return (
        <div className={dateRangeField.ends}>
            <RangeInput range="start" aria-label={start} />
            <span aria-hidden="true" className={dateRangeField.separator}>
                –
            </span>
            <RangeInput range="end" aria-label={end} />
        </div>
    );
}

export const DateRangeField = {
    Root: (props: ComponentProps<typeof RangePrimitive.Root>) => (
        <RangePrimitive.Root className={dateRangeField.root} {...props} />
    ),
    Input: RangeInput,
    Segment: DateField.Segment,
};

export const TimeRangeField = {
    Root: (props: ComponentProps<typeof TimeRangePrimitive.Root>) => (
        <TimeRangePrimitive.Root className={dateRangeField.root} {...props} />
    ),
    Input: RangeInput,
    Segment: DateField.Segment,
};
