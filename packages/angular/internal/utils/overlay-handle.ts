import {
    computed,
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

/**
 * The handle object of every overlay (each component types it with its own name). The roots
 * attached to it form a stack: the newest one serves the handle, and detaching it gives the
 * handle back to the previous one.
 */
export class OverlayHandleStore<Payload = unknown>
    implements OverlayHandle<Payload>
{
    private readonly stack: WritableSignal<readonly HandleRoot[]> = signal([]);
    private readonly attached: Signal<HandleRoot | null> = computed(
        () => this.stack().at(-1) ?? null,
    );

    /** The component it belongs to (`"dialog"`, `"menu"`, ...): a handle serves one kind. */
    readonly component: string;

    constructor(component: string) {
        this.component = component;
    }

    /** The attached root, `null` until one is attached (a signal its triggers render from). */
    readonly root: Signal<HandleRoot | null> = this.attached;

    /** Puts a root on top of the stack (again, if it already was attached). */
    attach(root: HandleRoot): void {
        this.stack.update((roots) => [
            ...roots.filter((other) => other !== root),
            root,
        ]);
    }

    /** Takes a root off the stack: the previous one serves the handle when it was on top. */
    detach(root: HandleRoot): void {
        if (untracked(this.stack).includes(root)) {
            this.stack.update((roots) =>
                roots.filter((other) => other !== root),
            );
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
