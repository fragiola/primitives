import { computed, type Ref, shallowRef, useId, watch } from "vue";
import type { ChangeDetails, ChangeReason } from "../utils/change-details.ts";
import { useControllable } from "./use-controllable.ts";
import { usePresence } from "./use-presence.ts";

export interface OverlayRootProps {
    open?: boolean;
    defaultOpen?: boolean;
}

export const overlayRootProps = {
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
};

/** `v-model:open`, and `@open-change="(open, details) => ..."` with the reason. */
export const overlayRootEmits = {
    "update:open": (_open: boolean) => true,
    openChange: (_open: boolean, _details: ChangeDetails) => true,
};

type OverlayEmit = {
    (event: "update:open", open: boolean): void;
    (event: "openChange", open: boolean, details: ChangeDetails): void;
};

/**
 * The state every overlay root shares: open (controlled with `v-model:open`, or not) with its
 * last reason, the trigger, positioner and popup elements, ids, and the popup's presence.
 *
 * `lastReason` is the reason of the change that made the current `open`: `null` when the bound
 * `open` changed with no request of the overlay's own (a close the consumer made), so a close
 * never reuses an earlier change's reason for its focus return.
 */
export function useOverlayRoot(props: OverlayRootProps, emit: OverlayEmit) {
    const state = useControllable<boolean, ChangeDetails>(
        () => props.open,
        props.defaultOpen ?? false,
        (next, details) => {
            emit("update:open", next);
            emit("openChange", next, details);
        },
    );
    const trigger = shallowRef<HTMLElement | null>(null);
    const positioner = shallowRef<HTMLElement | null>(null);
    const popup = shallowRef<HTMLElement | null>(null);
    const lastReason: { current: ChangeReason | null } = { current: null };
    let requested: boolean | null = null;
    const open = computed(() => state.value.value);
    // in the change itself, before the popup's watchers end its session (and read the reason)
    watch(
        open,
        (value) => {
            if (requested !== value) {
                lastReason.current = null;
            }
            requested = null;
        },
        { flush: "sync" },
    );
    const presence = usePresence(open as Ref<boolean>, () => popup.value);
    const baseId = useId();
    return {
        open,
        setOpen(next: boolean, reason: ChangeReason) {
            lastReason.current = reason;
            requested = next;
            state.set(next, { reason });
            // a request the consumer turned down is forgotten once it is answered
            queueMicrotask(() => {
                requested = null;
            });
        },
        lastReason,
        trigger,
        positioner,
        popup,
        presence,
        triggerId: `${baseId}-trigger`,
        popupId: `${baseId}-popup`,
    };
}

export type OverlayRoot = ReturnType<typeof useOverlayRoot>;

/** A function template ref that keeps the element in `target`. */
export function elementSetter(target: { value: HTMLElement | null }) {
    return (value: unknown) => {
        const element =
            value instanceof HTMLElement
                ? value
                : ((value as { $el?: HTMLElement } | null)?.$el ?? null);
        if (target.value !== element) {
            target.value = element;
        }
    };
}
