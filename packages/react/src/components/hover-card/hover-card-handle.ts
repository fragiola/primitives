import {
    type OverlayHandle,
    OverlayHandleStore,
} from "../../utils/overlay-handle.ts";

/** A HoverCard's handle: its detached Triggers and imperative opening (spec/hover-card.md). */
export interface HoverCardHandle<Payload = unknown>
    extends OverlayHandle<Payload> {
    readonly component: "hover-card";
}

/** Creates a HoverCard handle (`HoverCard.createHandle`), for Triggers outside the Root. */
export function createHoverCardHandle<
    Payload = unknown,
>(): HoverCardHandle<Payload> {
    return new OverlayHandleStore<Payload>(
        "hover-card",
    ) as HoverCardHandle<Payload>;
}
