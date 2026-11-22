import { booleanAttribute, Directive, input } from "@angular/core";
import { DialogTriggerBase } from "@fragiola/primitives-angular/dialog";
import type { DrawerHandle } from "../utils/drawer-handle.ts";

/**
 * Opens and closes the drawer (reason `trigger-press`), Dialog's Trigger: `<button drawerTrigger>`
 * inside the `[drawerRoot]`, or anywhere with a handle (`[handle]`, `[payload]`, `id`;
 * spec/drawer.md, "Detached triggers").
 */
@Directive({ selector: "[drawerTrigger]", exportAs: "drawerTrigger" })
export class DrawerTrigger<Payload = unknown> extends DialogTriggerBase<
    Payload,
    DrawerHandle<Payload>
> {
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The handle of a `[drawerRoot]` this trigger opens from anywhere. */
    readonly handle = input<DrawerHandle<Payload> | undefined>(undefined);
    /** What the root's `payload()` gives while this trigger is the active one. */
    readonly payload = input<Payload | undefined>(undefined);
    /** The trigger's id (generated when not given). */
    readonly id = input<string | undefined>(undefined);
}
