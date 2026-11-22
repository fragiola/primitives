import {
    type OverlayHandle,
    OverlayHandleStore,
} from "../../utils/overlay-handle.ts";

/** A Tooltip's handle: its detached Triggers and imperative opening (spec/tooltip.md). */
export interface TooltipHandle<Payload = unknown>
    extends OverlayHandle<Payload> {
    readonly component: "tooltip";
}

/** Creates a Tooltip handle (`Tooltip.createHandle`), for Triggers outside the Root. */
export const createTooltipHandle: <
    Payload = unknown,
>() => TooltipHandle<Payload> = <Payload>() =>
    new OverlayHandleStore<Payload>("tooltip") as TooltipHandle<Payload>;
