import { MultipleCalendar as Primitive } from "@fragiola/primitives-vue/multiple-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import { styled } from "../styled.ts";

export const MultipleCalendar = { Root: styled(Primitive.Root, calendar.root) };
