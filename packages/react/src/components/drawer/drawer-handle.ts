import {
    type OverlayHandle,
    OverlayHandleStore,
} from "../../utils/overlay-handle.ts";

/** A Drawer's handle: its detached Triggers and imperative opening (spec/drawer.md). */
export interface DrawerHandle<Payload = unknown>
    extends OverlayHandle<Payload> {
    readonly component: "drawer";
}

/** Creates a Drawer handle (`Drawer.createHandle`), for Triggers outside the Root. */
export function createDrawerHandle<Payload = unknown>(): DrawerHandle<Payload> {
    return new OverlayHandleStore<Payload>("drawer") as DrawerHandle<Payload>;
}
