import { Checkbox as Primitive } from "@fragiola/primitives-react/checkbox";
import { CheckboxGroup as PrimitiveGroup } from "@fragiola/primitives-react/checkbox-group";
import { checkbox, checkboxGroup } from "examples-shared/recipes/checkbox";
import type { ComponentProps } from "react";

export const Checkbox = {
    /** The styled checkbox, with its indicator: a check, or a dash while mixed. */
    Root: ({ children, ...props }: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={checkbox.root} {...props}>
            {children ?? (
                <Primitive.Indicator
                    className={checkbox.indicator}
                    render={(indicatorProps, state) => (
                        <span {...indicatorProps}>
                            {state.indeterminate ? "–" : "✓"}
                        </span>
                    )}
                />
            )}
        </Primitive.Root>
    ),
};

export const CheckboxGroup = (props: ComponentProps<typeof PrimitiveGroup>) => (
    <PrimitiveGroup className={checkboxGroup.root} {...props} />
);
