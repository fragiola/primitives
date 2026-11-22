import {
    type OverlayHandle,
    OverlayHandleStore,
} from "@fragiola/primitives-angular/internal";

/** A Popover's handle: its detached triggers and imperative opening (spec/popover.md). */
export interface PopoverHandle<Payload = unknown>
    extends OverlayHandle<Payload> {
    readonly component: "popover";
}

/** Creates a Popover handle, for `[popoverTrigger]`s outside the `[popoverRoot]` (`[handle]`). */
export function createPopoverHandle<
    Payload = unknown,
>(): PopoverHandle<Payload> {
    return new OverlayHandleStore<Payload>("popover") as PopoverHandle<Payload>;
}
