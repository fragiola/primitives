import { NumberField as Primitive } from "@fragiola/primitives-react/number-field";
import { numberField } from "examples-shared/recipes/number-field";
import type { ComponentProps } from "react";

export const NumberField = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={numberField.root} {...props} />
    ),
    Group: (props: ComponentProps<typeof Primitive.Group>) => (
        <Primitive.Group className={numberField.group} {...props} />
    ),
    Input: (props: ComponentProps<typeof Primitive.Input>) => (
        <Primitive.Input className={numberField.input} {...props} />
    ),
    /** The styled button, with its sign. */
    Increment: (props: ComponentProps<typeof Primitive.Increment>) => (
        <Primitive.Increment className={numberField.increment} {...props}>
            +
        </Primitive.Increment>
    ),
    Decrement: (props: ComponentProps<typeof Primitive.Decrement>) => (
        <Primitive.Decrement className={numberField.decrement} {...props}>
            −
        </Primitive.Decrement>
    ),
    ScrubArea: (props: ComponentProps<typeof Primitive.ScrubArea>) => (
        <Primitive.ScrubArea className={numberField.scrubArea} {...props} />
    ),
    ScrubAreaCursor: (
        props: ComponentProps<typeof Primitive.ScrubAreaCursor>,
    ) => (
        <Primitive.ScrubAreaCursor
            className={numberField.scrubAreaCursor}
            {...props}
        />
    ),
};
