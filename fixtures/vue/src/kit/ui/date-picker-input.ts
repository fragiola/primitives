import { DatePicker } from "@fragiola/primitives-vue/date-picker";
import { DatePickerInput as Primitive } from "@fragiola/primitives-vue/date-picker-input";
import { DateRangePickerInput as RangePrimitive } from "@fragiola/primitives-vue/date-range-picker-input";
import { dateField } from "examples-shared/recipes/date-field";
import { datePickerInput } from "examples-shared/recipes/date-picker";
import { styled } from "../styled.ts";

export const DatePickerInput = {
    Root: Primitive.Root,
    Segments: styled(Primitive.Segments, dateField.input),
};

export const DateRangePickerInput = {
    Root: RangePrimitive.Root,
    Segments: styled(RangePrimitive.Segments, dateField.input),
};

/** The calendar button beside the segments: an icon's place, named by `aria-label`. */
export const CalendarButton = styled(
    DatePicker.Trigger,
    datePickerInput.trigger,
);
