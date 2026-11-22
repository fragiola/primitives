import { Radio as Primitive } from "@fragiola/primitives-react/radio";
import { RadioGroup as PrimitiveGroup } from "@fragiola/primitives-react/radio-group";
import { radio, radioGroup } from "examples-shared/recipes/radio-group";
import type { ComponentProps } from "react";

export const RadioGroup = (props: ComponentProps<typeof PrimitiveGroup>) => (
    <PrimitiveGroup className={radioGroup.root} {...props} />
);

export const Radio = {
    /** The styled radio, with its dot. */
    Root: ({ children, ...props }: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={radio.root} {...props}>
            {children ?? <Primitive.Indicator className={radio.indicator} />}
        </Primitive.Root>
    ),
};
