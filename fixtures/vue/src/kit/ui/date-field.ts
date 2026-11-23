import { DateField as Primitive } from "@fragiola/primitives-vue/date-field";
import { DateRangeField as RangePrimitive } from "@fragiola/primitives-vue/date-range-field";
import { TimeField as TimePrimitive } from "@fragiola/primitives-vue/time-field";
import { TimeRangeField as TimeRangePrimitive } from "@fragiola/primitives-vue/time-range-field";
import { dateField, dateRangeField } from "examples-shared/recipes/date-field";
import { styled } from "../styled.ts";

export const DateField = {
    Root: styled(Primitive.Root, dateField.root),
    Input: styled(Primitive.Input, dateField.input),
    Segment: styled(Primitive.Segment, dateField.segment),
};

export const TimeField = {
    Root: styled(TimePrimitive.Root, dateField.root),
    Input: DateField.Input,
    Segment: DateField.Segment,
};

const RangeInput = styled(RangePrimitive.Input, dateField.input);

export const DateRangeField = {
    Root: styled(RangePrimitive.Root, dateRangeField.root),
    Input: RangeInput,
    Segment: DateField.Segment,
};

export const TimeRangeField = {
    Root: styled(TimeRangePrimitive.Root, dateRangeField.root),
    Input: RangeInput,
    Segment: DateField.Segment,
};
