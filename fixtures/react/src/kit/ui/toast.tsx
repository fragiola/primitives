import { Toast as Primitive } from "@fragiola/primitives-react/toast";
import { toast } from "examples-shared/recipes/toast";
import type { ComponentProps } from "react";

export const Toast = {
    Provider: Primitive.Provider,
    Portal: Primitive.Portal,
    useToastManager: Primitive.useToastManager,
    Viewport: (props: ComponentProps<typeof Primitive.Viewport>) => (
        <Primitive.Viewport className={toast.viewport} {...props} />
    ),
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={toast.root} {...props} />
    ),
    Title: (props: ComponentProps<typeof Primitive.Title>) => (
        <Primitive.Title className={toast.title} {...props} />
    ),
    Description: (props: ComponentProps<typeof Primitive.Description>) => (
        <Primitive.Description className={toast.description} {...props} />
    ),
    Action: (props: ComponentProps<typeof Primitive.Action>) => (
        <Primitive.Action className={toast.action} {...props} />
    ),
    Close: (props: ComponentProps<typeof Primitive.Close>) => (
        <Primitive.Close className={toast.close} {...props} />
    ),
};
