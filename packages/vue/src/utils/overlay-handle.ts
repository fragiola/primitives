import { type ShallowRef, shallowRef } from "vue";

/**
 * A handle of detached triggers (spec/README.md, "Detached triggers"): it connects a Root and
 * Triggers rendered anywhere. The open state and the payload stay in the Root; the handle holds
 * the attached Root's context, which its Triggers render from, and forwards its methods to that
 * Root. A call while no Root is attached does nothing.
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

/** What a Root attaches to its handle: its context, with the handle's entry points. */
export interface HandleBinding {
    open: { readonly value: boolean };
    openFromHandle: (triggerId: string | null) => void;
    openWithPayload: (payload: unknown) => void;
    closeFromHandle: () => void;
}

/** The handle object of every overlay (each component types it with its own name). */
export class OverlayHandleStore<Payload = unknown>
    implements OverlayHandle<Payload>
{
    // reactive: a Trigger rendered before its Root renders again once the Root is attached
    private readonly binding: ShallowRef<HandleBinding | null> =
        shallowRef(null);

    /** The component it belongs to (`"dialog"`, `"menu"`, ...): a handle serves one kind. */
    readonly component: string;

    constructor(component: string) {
        this.component = component;
    }

    attach(binding: HandleBinding): void {
        this.binding.value = binding;
    }

    detach(binding: HandleBinding): void {
        if (this.binding.value === binding) {
            this.binding.value = null;
        }
    }

    getBinding(): HandleBinding | null {
        return this.binding.value;
    }

    open(triggerId: string | null): void {
        this.binding.value?.openFromHandle(triggerId);
    }

    openWithPayload(payload: Payload): void {
        this.binding.value?.openWithPayload(payload);
    }

    close(): void {
        this.binding.value?.closeFromHandle();
    }

    get isOpen(): boolean {
        return this.binding.value?.open.value ?? false;
    }
}
