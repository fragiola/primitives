import { SegmentedControl as Primitive } from "@fragiola/primitives-react/segmented-control";
import { segmentedControl } from "examples-shared/recipes/segmented-control";
import type { ComponentProps } from "react";

export const SegmentedControl = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={segmentedControl.root} {...props} />
    ),
    /** The styled Item, its label in an ItemText. */
    Item: ({ children, ...props }: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={segmentedControl.item} {...props}>
            <Primitive.ItemText className={segmentedControl["item-text"]}>
                {children}
            </Primitive.ItemText>
        </Primitive.Item>
    ),
    Indicator: (props: ComponentProps<typeof Primitive.Indicator>) => (
        <Primitive.Indicator
            className={segmentedControl.indicator}
            {...props}
        />
    ),
};
