import { DateField as Primitive } from "@fragiola/primitives-vue/date-field";
import { TimeField as TimePrimitive } from "@fragiola/primitives-vue/time-field";
import { dateField } from "examples-shared/recipes/date-field";
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
