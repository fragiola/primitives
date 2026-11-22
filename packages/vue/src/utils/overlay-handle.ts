import { computed, type ShallowRef, shallowRef } from "vue";

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

/**
 * The handle object of every overlay (each component types it with its own name). The Roots
 * attached to it form a stack: the newest one serves the handle, and detaching it gives the
 * handle back to the previous one.
 */
export class OverlayHandleStore<Payload = unknown>
    implements OverlayHandle<Payload>
{
    // reactive: a Trigger rendered before its Root renders again once the Root is attached
    private readonly attached: ShallowRef<readonly HandleBinding[]> =
        shallowRef([]);
    private readonly binding = computed(
        () => this.attached.value.at(-1) ?? null,
    );

    /** The component it belongs to (`"dialog"`, `"menu"`, ...): a handle serves one kind. */
    readonly component: string;

    constructor(component: string) {
        this.component = component;
    }

    /** Puts a Root on top of the stack (again, if it already was attached). */
    attach(binding: HandleBinding): void {
        this.attached.value = [
            ...this.attached.value.filter((other) => other !== binding),
            binding,
        ];
    }

    /** Takes a Root off the stack: the previous one serves the handle when it was on top. */
    detach(binding: HandleBinding): void {
        if (this.attached.value.includes(binding)) {
            this.attached.value = this.attached.value.filter(
                (other) => other !== binding,
            );
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
