import {
    type OverlayHandle,
    OverlayHandleStore,
} from "@fragiola/primitives-angular/internal";

/** A HoverCard's handle: its detached triggers and imperative opening (spec/hover-card.md). */
export interface HoverCardHandle<Payload = unknown>
    extends OverlayHandle<Payload> {
    readonly component: "hover-card";
}

/** Creates a HoverCard handle, for `[hoverCardTrigger]`s outside the `[hoverCardRoot]` (`[handle]`). */
export function createHoverCardHandle<
    Payload = unknown,
>(): HoverCardHandle<Payload> {
    return new OverlayHandleStore<Payload>(
        "hover-card",
    ) as HoverCardHandle<Payload>;
}
