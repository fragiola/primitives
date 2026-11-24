import { CascadeSelect as Primitive } from "@fragiola/primitives-react/cascade-select";
import { cascadeSelect } from "examples-shared/recipes/cascade-select";
import type { ComponentProps } from "react";

export const CascadeSelect = {
    Root: Primitive.Root,
    Portal: Primitive.Portal,
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={cascadeSelect.trigger} {...props} />
    ),
    Value: (props: ComponentProps<typeof Primitive.Value>) => (
        <Primitive.Value className={cascadeSelect.value} {...props} />
    ),
    Positioner: (props: ComponentProps<typeof Primitive.Positioner>) => (
        <Primitive.Positioner className={cascadeSelect.positioner} {...props} />
    ),
    Popup: (props: ComponentProps<typeof Primitive.Popup>) => (
        <Primitive.Popup className={cascadeSelect.popup} {...props} />
    ),
    Level: (props: ComponentProps<typeof Primitive.Level>) => (
        <Primitive.Level className={cascadeSelect.level} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={cascadeSelect.item} {...props} />
    ),
    ItemIndicator: (props: ComponentProps<typeof Primitive.ItemIndicator>) => (
        <Primitive.ItemIndicator
            className={cascadeSelect["item-indicator"]}
            {...props}
        />
    ),
};
