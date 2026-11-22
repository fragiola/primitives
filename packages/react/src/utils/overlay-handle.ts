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

/** The handle object of every overlay (each component types it with its own name). */
export class OverlayHandleStore<Payload = unknown>
    implements OverlayHandle<Payload>
{
    private binding: HandleBinding | null = null;
    private readonly listeners = new Set<() => void>();

    /** The component it belongs to (`"dialog"`, `"menu"`, ...): a handle serves one kind. */
    readonly component: string;

    constructor(component: string) {
        this.component = component;
    }

    attach(binding: HandleBinding): void {
        this.binding = binding;
        for (const listener of this.listeners) {
            listener();
        }
    }

    detach(binding: HandleBinding): void {
        if (this.binding === binding) {
            this.binding = null;
            for (const listener of this.listeners) {
                listener();
            }
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
