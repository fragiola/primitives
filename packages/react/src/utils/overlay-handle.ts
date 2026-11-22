/**
 * A handle of detached triggers (spec/README.md, "Detached triggers"): it connects a Root and
 * Triggers rendered anywhere. The open state and the payload stay in the Root; the handle holds
 * the attached Root's context value, which its Triggers render from, and forwards its methods to
 * that Root. A call while no Root is attached does nothing.
 */
export interface OverlayHandle<Payload = unknown> {
    /** Opens from the Trigger of this id (the active trigger), or with no trigger (`null`). */
    open(triggerId: string | null): void;
    /** Opens with this payload and no trigger. */
    openWithPayload(payload: Payload): void;
    /** Closes it (reason `imperative-action`). */
    close(): void;
    readonly isOpen: boolean;
}

/** What a Root attaches to its handle: its context value, with the handle's entry points. */
export interface HandleBinding {
    open: boolean;
    openFromHandle: (triggerId: string | null) => void;
    openWithPayload: (payload: unknown) => void;
    closeFromHandle: () => void;
}

/** A Root's place on its handle: the same object while the Root stays mounted. */
export interface HandleSlot {
    /** The Root's context value now. */
    binding: HandleBinding;
}

/**
 * The handle object of every overlay (each component types it with its own name). The Roots
 * attached to it form a stack: the newest one serves the handle, and detaching it gives the
 * handle back to the previous one.
 */
export class OverlayHandleStore<Payload = unknown>
    implements OverlayHandle<Payload>
{
    private readonly slots: HandleSlot[] = [];
    private readonly listeners = new Set<() => void>();

    /** The component it belongs to (`"dialog"`, `"menu"`, ...): a handle serves one kind. */
    readonly component: string;

    constructor(component: string) {
        this.component = component;
    }

    private get binding(): HandleBinding | null {
        return this.slots.at(-1)?.binding ?? null;
    }

    private notify(): void {
        for (const listener of this.listeners) {
            listener();
        }
    }

    /** Puts a Root on top of the stack (again, if it already was attached). */
    attach(slot: HandleSlot): void {
        const index = this.slots.indexOf(slot);
        if (index !== -1) {
            this.slots.splice(index, 1);
        }
        this.slots.push(slot);
        this.notify();
    }

    /** Takes a Root off the stack: the previous one serves the handle when it was on top. */
    detach(slot: HandleSlot): void {
        const index = this.slots.indexOf(slot);
        if (index === -1) {
            return;
        }
        this.slots.splice(index, 1);
        if (index === this.slots.length) {
            this.notify();
        }
    }

    /** A Root's context value changed: its Triggers render again when it serves the handle. */
    update(slot: HandleSlot, binding: HandleBinding): void {
        slot.binding = binding;
        if (this.slots.at(-1) === slot) {
            this.notify();
        }
    }

    readonly subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    readonly getBinding = (): HandleBinding | null => this.binding;

    open(triggerId: string | null): void {
        this.binding?.openFromHandle(triggerId);
    }

    openWithPayload(payload: Payload): void {
        this.binding?.openWithPayload(payload);
    }

    close(): void {
        this.binding?.closeFromHandle();
    }

    get isOpen(): boolean {
        return this.binding?.open ?? false;
    }
}
