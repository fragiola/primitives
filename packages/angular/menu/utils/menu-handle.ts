import {
    type OverlayHandle,
    OverlayHandleStore,
} from "@fragiola/primitives-angular/internal";

/** A Menu's handle: its detached triggers and imperative opening (spec/menu.md). */
export interface MenuHandle<Payload = unknown> extends OverlayHandle<Payload> {
    readonly component: "menu";
}

/** Creates a Menu handle, for `[menuTrigger]`s outside the `[menuRoot]` (`[handle]`). */
export function createMenuHandle<Payload = unknown>(): MenuHandle<Payload> {
    return new OverlayHandleStore<Payload>("menu") as MenuHandle<Payload>;
}
