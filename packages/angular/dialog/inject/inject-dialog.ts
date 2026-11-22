import type { Signal } from "@angular/core";
import type { ChangeReason } from "@fragiola/primitives-angular/internal";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import {
    DialogRootBase,
    type DialogState,
} from "../directives/dialog-root-base.ts";

/**
 * The part hook of the enclosing `[dialogRoot]` (or `[alertDialogRoot]`) (spec/README.md, API mapping: Angular): its state,
 * and a way to open or close it, for a component of the consumer's inside the dialog.
 */
export function injectDialog(): {
    state: Signal<DialogState>;
    setOpen: (open: boolean, reason?: ChangeReason) => void;
} {
    const root = injectEnclosing(DialogRootBase, "dialogRoot", "injectDialog");
    return {
        state: root.state,
        setOpen: (open, reason = "none") => root.overlay.setOpen(open, reason),
    };
}
