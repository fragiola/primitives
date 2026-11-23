import { DateField as Primitive } from "@fragiola/primitives-react/date-field";
import { TimeField as TimePrimitive } from "@fragiola/primitives-react/time-field";
import { dateField } from "examples-shared/recipes/date-field";
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
