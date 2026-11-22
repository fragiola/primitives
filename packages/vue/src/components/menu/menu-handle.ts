import {
    type OverlayHandle,
    OverlayHandleStore,
} from "../../utils/overlay-handle.ts";

/** A Menu's handle: its detached Triggers and imperative opening (spec/menu.md). */
export interface MenuHandle<Payload = unknown> extends OverlayHandle<Payload> {
    readonly component: "menu";
}

/** Creates a Menu handle (`Menu.createHandle`), for Triggers outside the Root. */
export const createMenuHandle: <Payload = unknown>() => MenuHandle<Payload> = <
    Payload,
>() => new OverlayHandleStore<Payload>("menu") as MenuHandle<Payload>;
