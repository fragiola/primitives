import { MonthCalendar as Primitive } from "@fragiola/primitives-vue/month-calendar";
import { MonthRangeCalendar as MonthRangePrimitive } from "@fragiola/primitives-vue/month-range-calendar";
import { YearCalendar as YearPrimitive } from "@fragiola/primitives-vue/year-calendar";
import { YearRangeCalendar as YearRangePrimitive } from "@fragiola/primitives-vue/year-range-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import { styled } from "../styled.ts";

export const MonthCalendar = { Root: styled(Primitive.Root, calendar.root) };
export const MonthRangeCalendar = {
    Root: styled(MonthRangePrimitive.Root, calendar.root),
};
export const YearCalendar = { Root: styled(YearPrimitive.Root, calendar.root) };
export const YearRangeCalendar = {
    Root: styled(YearRangePrimitive.Root, calendar.root),
};
