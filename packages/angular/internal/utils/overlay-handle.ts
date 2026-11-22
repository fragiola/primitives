import {
    effect,
    type Signal,
    signal,
    untracked,
    type WritableSignal,
} from "@angular/core";
import type { OverlayRoot } from "./overlay-root.ts";

/**
 * A handle of detached triggers (spec/README.md, "Detached triggers"): it connects a root directive
 * and trigger directives rendered anywhere. The open state and the payload stay in the root; the
 * handle holds the attached root, which its triggers read, and forwards its methods to it. A call
 * while no root is attached does nothing.
 */
export interface OverlayHandle<Payload = unknown> {
    /** Opens from the trigger of this id (the active trigger), or with no trigger (`null`). */
    open(triggerId: string | null): void;
    /** Opens with this payload and no trigger. */
    openWithPayload(payload: Payload): void;
    /** Closes it (reason `imperative-action`). */
    close(): void;
    readonly isOpen: boolean;
}

/** What a root directive attaches to its handle: itself, with its overlay state. */
export interface HandleRoot {
    readonly overlay: OverlayRoot;
}

/** The handle object of every overlay (each component types it with its own name). */
export class OverlayHandleStore<Payload = unknown>
    implements OverlayHandle<Payload>
{
    private readonly attached: WritableSignal<HandleRoot | null> = signal(null);

    /** The component it belongs to (`"dialog"`, `"menu"`, ...): a handle serves one kind. */
    readonly component: string;

    constructor(component: string) {
        this.component = component;
    }

    /** The attached root, `null` until one is attached (a signal its triggers render from). */
    readonly root: Signal<HandleRoot | null> = this.attached.asReadonly();

    attach(root: HandleRoot): void {
        this.attached.set(root);
    }

    detach(root: HandleRoot): void {
        if (untracked(this.attached) === root) {
            this.attached.set(null);
        }
    }

    open(triggerId: string | null): void {
        untracked(this.attached)?.overlay.openFromHandle(triggerId);
    }

    openWithPayload(payload: Payload): void {
        untracked(this.attached)?.overlay.openWithPayload(payload);
    }

    close(): void {
        untracked(this.attached)?.overlay.closeFromHandle();
    }

    get isOpen(): boolean {
        return untracked(this.attached)?.overlay.open() ?? false;
    }
}

/**
 * Attaches a root directive to its `[handle]` while it is set, in the root's injection context.
 */
export function attachHandle(
    handle: Signal<OverlayHandle<never> | undefined>,
    root: HandleRoot,
): void {
    effect((onCleanup) => {
        const store = handle() as OverlayHandleStore<never> | undefined;
        if (store === undefined) {
            return;
        }
        untracked(() => store.attach(root));
        onCleanup(() => store.detach(root));
    });
}
