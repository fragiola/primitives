import {
    type OverlayHandle,
    OverlayHandleStore,
} from "@fragiola/primitives-angular/internal";

/** A Drawer's handle: its detached triggers and imperative opening (spec/drawer.md). */
export interface DrawerHandle<Payload = unknown>
    extends OverlayHandle<Payload> {
    readonly component: "drawer";
}

/** Creates a Drawer handle, for `[drawerTrigger]`s outside the `[drawerRoot]` (`[handle]`). */
export function createDrawerHandle<Payload = unknown>(): DrawerHandle<Payload> {
    return new OverlayHandleStore<Payload>("drawer") as DrawerHandle<Payload>;
}
