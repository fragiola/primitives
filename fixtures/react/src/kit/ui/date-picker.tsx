import { DatePicker as Primitive } from "@fragiola/primitives-react/date-picker";
import { datePicker } from "examples-shared/recipes/date-picker";
import type { ComponentProps } from "react";

export const DatePicker = {
    Portal: Primitive.Portal,
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={datePicker.trigger} {...props} />
    ),
    Positioner: (props: ComponentProps<typeof Primitive.Positioner>) => (
        <Primitive.Positioner className={datePicker.positioner} {...props} />
    ),
    Popup: (props: ComponentProps<typeof Primitive.Popup>) => (
        <Primitive.Popup className={datePicker.popup} {...props} />
    ),
};
