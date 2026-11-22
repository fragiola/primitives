import { Fieldset as Primitive } from "@fragiola/primitives-react/fieldset";
import { fieldset } from "examples-shared/recipes/fieldset";
import type { ComponentProps } from "react";

export const Fieldset = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={fieldset.root} {...props} />
    ),
    Legend: (props: ComponentProps<typeof Primitive.Legend>) => (
        <Primitive.Legend className={fieldset.legend} {...props} />
    ),
};
