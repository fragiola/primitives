import type { Signal } from "@angular/core";
import {
    type ChangeReason,
    injectEnclosing,
} from "@fragiola/primitives-angular/internal";
import {
    TooltipRoot,
    type TooltipState,
} from "../directives/tooltip-root.directive.ts";

/** The part hook of the enclosing `[tooltipRoot]`: its state, and a way to open or close it. */
export function injectTooltip(): {
    state: Signal<TooltipState>;
    setOpen: (open: boolean, reason?: ChangeReason) => void;
} {
    const root = injectEnclosing(TooltipRoot, "tooltipRoot", "injectTooltip");
    return {
        state: root.state,
        setOpen: (open, reason = "none") => root.overlay.setOpen(open, reason),
    };
}
