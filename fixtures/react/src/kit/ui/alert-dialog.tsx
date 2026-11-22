import { AlertDialog as Primitive } from "@fragiola/primitives-react/alert-dialog";
import { alertDialog } from "examples-shared/recipes/alert-dialog";
import type { ComponentProps } from "react";

// The styled layer: each part gets its recipe (a per-framework Fragiola UI in miniature).
export const AlertDialog = {
    Root: Primitive.Root,
    createHandle: Primitive.createHandle,
    Portal: Primitive.Portal,
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={alertDialog.trigger} {...props} />
    ),
    Backdrop: (props: ComponentProps<typeof Primitive.Backdrop>) => (
        <Primitive.Backdrop className={alertDialog.backdrop} {...props} />
    ),
    Viewport: (props: ComponentProps<typeof Primitive.Viewport>) => (
        <Primitive.Viewport className={alertDialog.viewport} {...props} />
    ),
    Popup: (props: ComponentProps<typeof Primitive.Popup>) => (
        <Primitive.Popup className={alertDialog.popup} {...props} />
    ),
    Title: (props: ComponentProps<typeof Primitive.Title>) => (
        <Primitive.Title className={alertDialog.title} {...props} />
    ),
    Description: (props: ComponentProps<typeof Primitive.Description>) => (
        <Primitive.Description className={alertDialog.description} {...props} />
    ),
    Close: (props: ComponentProps<typeof Primitive.Close>) => (
        <Primitive.Close className={alertDialog.close} {...props} />
    ),
    // the app's own destructive answer: a plain button (no part)
    Action: (props: ComponentProps<"button">) => (
        <button type="button" className={alertDialog.action} {...props} />
    ),
};
