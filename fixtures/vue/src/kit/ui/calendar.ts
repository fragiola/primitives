import { Calendar as Primitive } from "@fragiola/primitives-vue/calendar";
import { RangeCalendar as RangePrimitive } from "@fragiola/primitives-vue/range-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import { styled } from "../styled.ts";

export const Calendar = { Root: styled(Primitive.Root, calendar.root) };
export const RangeCalendar = {
    Root: styled(RangePrimitive.Root, calendar.root),
};
