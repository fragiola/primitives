import { Breadcrumbs as Primitive } from "@fragiola/primitives-react/breadcrumbs";
import { breadcrumbs } from "examples-shared/recipes/breadcrumbs";
import type { ComponentProps } from "react";

export const Breadcrumbs = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={breadcrumbs.root} {...props} />
    ),
    List: (props: ComponentProps<typeof Primitive.List>) => (
        <Primitive.List className={breadcrumbs.list} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={breadcrumbs.item} {...props} />
    ),
    Link: (props: ComponentProps<typeof Primitive.Link>) => (
        <Primitive.Link className={breadcrumbs.link} {...props} />
    ),
    Current: (props: ComponentProps<typeof Primitive.Current>) => (
        <Primitive.Current className={breadcrumbs.current} {...props} />
    ),
    Separator: (props: ComponentProps<typeof Primitive.Separator>) => (
        <Primitive.Separator className={breadcrumbs.separator} {...props} />
    ),
    Ellipsis: (props: ComponentProps<typeof Primitive.Ellipsis>) => (
        <Primitive.Ellipsis className={breadcrumbs.ellipsis} {...props} />
    ),
};
