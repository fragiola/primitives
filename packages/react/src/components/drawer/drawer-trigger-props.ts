import type { DialogTriggerProps } from "../dialog/dialog-trigger.tsx";
import type { DrawerHandle } from "./drawer-handle.ts";

/** The props of `Drawer.Trigger` (Dialog's Trigger), with a Drawer handle. */
export interface DrawerTriggerProps<Payload = unknown>
    extends Omit<DialogTriggerProps<Payload>, "handle"> {
    /** The handle of a Root this Trigger opens from anywhere (spec/drawer.md). */
    handle?: DrawerHandle<Payload>;
}
