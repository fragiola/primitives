import {
    type OverlayHandle,
    OverlayHandleStore,
} from "../../utils/overlay-handle.ts";

/** A Popover's handle: its detached Triggers and imperative opening (spec/popover.md). */
export interface PopoverHandle<Payload = unknown>
    extends OverlayHandle<Payload> {
    readonly component: "popover";
}

/** Creates a Popover handle (`Popover.createHandle`), for Triggers outside the Root. */
export const createPopoverHandle: <
    Payload = unknown,
>() => PopoverHandle<Payload> = <Payload>() =>
    new OverlayHandleStore<Payload>("popover") as PopoverHandle<Payload>;
