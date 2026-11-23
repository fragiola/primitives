import { Pagination as Primitive } from "@fragiola/primitives-react/pagination";
import { pagination } from "examples-shared/recipes/pagination";
import type { ComponentProps } from "react";

export const Pagination = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={pagination.root} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={pagination.item} {...props} />
    ),
    Ellipsis: (props: ComponentProps<typeof Primitive.Ellipsis>) => (
        <Primitive.Ellipsis className={pagination.ellipsis} {...props} />
    ),
    Previous: (props: ComponentProps<typeof Primitive.Previous>) => (
        <Primitive.Previous className={pagination.control} {...props} />
    ),
    Next: (props: ComponentProps<typeof Primitive.Next>) => (
        <Primitive.Next className={pagination.control} {...props} />
    ),
    First: (props: ComponentProps<typeof Primitive.First>) => (
        <Primitive.First className={pagination.control} {...props} />
    ),
    Last: (props: ComponentProps<typeof Primitive.Last>) => (
        <Primitive.Last className={pagination.control} {...props} />
    ),
};
