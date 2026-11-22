import { Menu as Primitive } from "@fragiola/primitives-react/menu";
import { menu } from "examples-shared/recipes/menu";
import type { ComponentProps } from "react";

export const Menu = {
    Root: Primitive.Root,
    createHandle: Primitive.createHandle,
    SubmenuRoot: Primitive.SubmenuRoot,
    Portal: Primitive.Portal,
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={menu.trigger} {...props} />
    ),
    Positioner: (props: ComponentProps<typeof Primitive.Positioner>) => (
        <Primitive.Positioner className={menu.positioner} {...props} />
    ),
    Popup: (props: ComponentProps<typeof Primitive.Popup>) => (
        <Primitive.Popup className={menu.popup} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={menu.item} {...props} />
    ),
    Separator: (props: ComponentProps<typeof Primitive.Separator>) => (
        <Primitive.Separator className={menu.separator} {...props} />
    ),
    Group: (props: ComponentProps<typeof Primitive.Group>) => (
        <Primitive.Group className={menu.group} {...props} />
    ),
    GroupLabel: (props: ComponentProps<typeof Primitive.GroupLabel>) => (
        <Primitive.GroupLabel className={menu["group-label"]} {...props} />
    ),
    CheckboxItem: (props: ComponentProps<typeof Primitive.CheckboxItem>) => (
        <Primitive.CheckboxItem className={menu["checkbox-item"]} {...props} />
    ),
    CheckboxItemIndicator: (
        props: ComponentProps<typeof Primitive.CheckboxItemIndicator>,
    ) => (
        <Primitive.CheckboxItemIndicator
            className={menu["checkbox-item-indicator"]}
            {...props}
        />
    ),
    RadioGroup: (props: ComponentProps<typeof Primitive.RadioGroup>) => (
        <Primitive.RadioGroup className={menu["radio-group"]} {...props} />
    ),
    RadioItem: (props: ComponentProps<typeof Primitive.RadioItem>) => (
        <Primitive.RadioItem className={menu["radio-item"]} {...props} />
    ),
    RadioItemIndicator: (
        props: ComponentProps<typeof Primitive.RadioItemIndicator>,
    ) => (
        <Primitive.RadioItemIndicator
            className={menu["radio-item-indicator"]}
            {...props}
        />
    ),
    SubmenuTrigger: (
        props: ComponentProps<typeof Primitive.SubmenuTrigger>,
    ) => (
        <Primitive.SubmenuTrigger
            className={menu["submenu-trigger"]}
            {...props}
        />
    ),
};
