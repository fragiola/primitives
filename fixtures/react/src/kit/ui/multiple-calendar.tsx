import { MultipleCalendar as Primitive } from "@fragiola/primitives-react/multiple-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import type { ComponentProps } from "react";

export const MultipleCalendar = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={calendar.root} {...props} />
    ),
};
