import { DatePicker as Primitive } from "@fragiola/primitives-vue/date-picker";
import { datePicker } from "examples-shared/recipes/date-picker";
import { styled } from "../styled.ts";

export const DatePicker = {
    Portal: Primitive.Portal,
    Trigger: styled(Primitive.Trigger, datePicker.trigger),
    Positioner: styled(Primitive.Positioner, datePicker.positioner),
    Popup: styled(Primitive.Popup, datePicker.popup),
};
