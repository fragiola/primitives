import { computed, effect, type Signal, untracked } from "@angular/core";
import { injectHost } from "./host-element.ts";
import { injectId } from "./inject-id.ts";
import type {
    HandleRoot,
    OverlayHandle,
    OverlayHandleStore,
} from "./overlay-handle.ts";

/** What a trigger directive of an overlay with detached triggers declares. */
export interface OverlayTriggerInputs {
    /** The handle of a root this trigger opens from anywhere (spec/README.md, "Detached triggers"). */
    handle: Signal<OverlayHandle<never> | undefined>;
    /** What the root's `payload()` gives while this trigger is the active one. */
    payload: Signal<unknown>;
    /** The trigger's id (generated when not given): `triggerId` and the handle's `open` name it. */
    id: Signal<string | undefined>;
}

/**
 * A trigger of an overlay with detached triggers, in its directive's injection context: its root
 * (the enclosing root directive, or the one attached to its `[handle]`, `null` until that root is
 * attached), its id, its registration with the root while it lives, and whether it is the active
 * trigger of the open overlay.
 */
export function overlayTrigger<Root extends HandleRoot>(
    enclosing: Root | null,
    inputs: OverlayTriggerInputs,
    options: { prefix: string; selector: string },
) {
    const host = injectHost();
    const generated = injectId(`${options.prefix}-trigger`);
    const id = computed(() => inputs.id() ?? generated);
    const root = computed((): Root | null => {
        const handle = inputs.handle() as OverlayHandleStore<never> | undefined;
        return handle === undefined
            ? enclosing
            : (handle.root() as Root | null);
    });
    effect((onCleanup) => {
        const current = root();
        const triggerId = id();
        if (current === null) {
            if (untracked(inputs.handle) === undefined) {
                throw new Error(
                    `[${options.selector}] must be inside its root, or have a [handle].`,
                );
            }
            return;
        }
        onCleanup(
            untracked(() =>
                current.overlay.registerTrigger(
                    triggerId,
                    host,
                    inputs.payload,
                ),
            ),
        );
    });
    const active = computed(() => {
        const current = root();
        return (
            current?.overlay.open() === true &&
            current.overlay.activeTriggerId() === id()
        );
    });
    return { root, id, active, host };
}
