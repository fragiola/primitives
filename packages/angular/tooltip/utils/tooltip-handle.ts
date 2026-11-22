import {
    type OverlayHandle,
    OverlayHandleStore,
} from "@fragiola/primitives-angular/internal";

/** A Tooltip's handle: its detached triggers and imperative opening (spec/tooltip.md). */
export interface TooltipHandle<Payload = unknown>
    extends OverlayHandle<Payload> {
    readonly component: "tooltip";
}

/** Creates a Tooltip handle, for `[tooltipTrigger]`s outside the `[tooltipRoot]` (`[handle]`). */
export function createTooltipHandle<
    Payload = unknown,
>(): TooltipHandle<Payload> {
    return new OverlayHandleStore<Payload>("tooltip") as TooltipHandle<Payload>;
}
