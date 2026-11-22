import type { Signal } from "@angular/core";
import {
    type ChangeReason,
    injectEnclosing,
} from "@fragiola/primitives-angular/internal";
import {
    PopoverRoot,
    type PopoverState,
} from "../directives/popover-root.directive.ts";

/** The part hook of the enclosing `[popoverRoot]`: its state, and a way to open or close it. */
export function injectPopover(): {
    state: Signal<PopoverState>;
    setOpen: (open: boolean, reason?: ChangeReason) => void;
} {
    const root = injectEnclosing(PopoverRoot, "popoverRoot", "injectPopover");
    return {
        state: root.state,
        setOpen: (open, reason = "none") => root.overlay.setOpen(open, reason),
    };
}
