import {
    computed,
    type PropType,
    type Ref,
    shallowReactive,
    shallowRef,
    useId,
    watch,
} from "vue";
import {
    type ChangeReason,
    createOpenChangeDetails,
    type OpenChangeDetails,
    type OverlayActions,
} from "../utils/change-details.ts";
import { usePresence } from "./use-presence.ts";

export interface OverlayRootProps {
    open?: boolean;
    defaultOpen?: boolean;
}

/** The props of a Root with detached triggers (spec/README.md, "Detached triggers"). */
export interface OverlayTriggerRootProps {
    /** The id of the active trigger, controlled together with `open`. */
    triggerId?: string | null;
    defaultTriggerId?: string | null;
}

export const overlayRootProps = {
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
};

export const overlayTriggerRootProps = {
    /** The id of the active trigger, controlled together with `open`. */
    triggerId: {
        type: [String, null] as PropType<string | null>,
        default: undefined,
    },
    defaultTriggerId: {
        type: [String, null] as PropType<string | null>,
        default: undefined,
    },
};

/**
 * `v-model:open`, `@open-change="(open, details) => ..."` (emitted first: `details.cancel()` keeps
 * the state, and `update:open` is then not emitted) and `@open-change-complete="(open) => ..."`.
 */
export const overlayRootEmits = {
    "update:open": (_open: boolean) => true,
    openChange: (_open: boolean, _details: OpenChangeDetails) => true,
    openChangeComplete: (_open: boolean) => true,
};

/** The events every overlay Root emits (its `*RootEmits` type). */
export type OverlayRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: OpenChangeDetails) => true;
    openChangeComplete: (open: boolean) => true;
};

type OverlayEmit = {
    (event: "update:open", open: boolean): void;
    (event: "openChange", open: boolean, details: OpenChangeDetails): void;
    (event: "openChangeComplete", open: boolean): void;
};

/** A Trigger the Root knows: its element and its current payload. */
interface TriggerEntry {
    element: HTMLElement;
    payload: () => unknown;
}

/**
 * The state every overlay root shares: open (controlled with `v-model:open`, or not) with its
 * last reason, the triggers (the active one), positioner and popup elements, ids, the popup's
 * presence, the payload of detached triggers and the actions.
 *
 * `lastReason` is the reason of the change that made the current `open`: `null` when the bound
 * `open` changed with no request of the overlay's own (a close the consumer made), so a close
 * never reuses an earlier change's reason for its focus return.
 *
 * `setOpen` emits `open-change` before it changes the state and returns whether the change
 * happened (a canceled one, or one with nothing to change, did not).
 */
export function useOverlayRoot(
    props: OverlayRootProps & OverlayTriggerRootProps,
    emit: OverlayEmit,
) {
    const own = shallowRef(props.defaultOpen ?? false);
    const open = computed(() =>
        props.open !== undefined ? props.open : own.value,
    );

    // the triggers: one set through `trigger` (Select, Combobox, the pickers, a submenu), or any
    // number registered by their id (Dialog, Popover, Menu, Tooltip)
    const single = shallowRef<HTMLElement | null>(null);
    const registry = shallowReactive(new Map<string, TriggerEntry>());
    const registerTrigger = (
        id: string,
        element: HTMLElement,
        payload: () => unknown,
    ) => {
        registry.set(id, { element, payload });
        return () => {
            if (registry.get(id)?.element === element) {
                registry.delete(id);
            }
        };
    };
    const ownTriggerId = shallowRef<string | null>(
        props.defaultTriggerId ?? null,
    );
    const requestedTriggerId = computed(() =>
        props.triggerId !== undefined ? props.triggerId : ownTriggerId.value,
    );
    // an explicit payload (`openWithPayload`), else the active trigger's
    const explicitPayload = shallowRef<{ value: unknown } | null>(null);

    // the active trigger: the requested one, else the first registered, else the single one
    const active = computed(() => {
        const id = requestedTriggerId.value;
        const requested = id === null ? undefined : registry.get(id);
        if (requested !== undefined && id !== null) {
            return { id, ...requested };
        }
        const first = registry.entries().next();
        if (first.done !== true) {
            const [firstId, entry] = first.value;
            return { id: firstId, ...entry };
        }
        return null;
    });
    // writable: a part with a single trigger (an input, a submenu's item) sets it
    const trigger = computed<HTMLElement | null>({
        get: () => active.value?.element ?? single.value,
        set: (element) => {
            single.value = element;
        },
    });
    const activeTriggerId = computed(
        () => active.value?.id ?? single.value?.id ?? null,
    );
    const triggers = computed(() => {
        const all = [...registry.values()].map((entry) => entry.element);
        return single.value ? [...all, single.value] : all;
    });
    const payload = computed(() =>
        explicitPayload.value
            ? explicitPayload.value.value
            : active.value?.payload(),
    );

    const positioner = shallowRef<HTMLElement | null>(null);
    const popup = shallowRef<HTMLElement | null>(null);
    const lastReason: { current: ChangeReason | null } = { current: null };
    let requested: boolean | null = null;
    // the open state just reported, until the update it causes: a second report of the same change
    // in the same task (a popover's Tab-out, then its focus watch) is not repeated
    let pending: { open: boolean; trigger: HTMLElement | null } | null = null;

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
    const presence = usePresence(open, () => popup.value, {
        onComplete: (value) => emit("openChangeComplete", value),
    });

    function setOpen(
        next: boolean,
        reason: ChangeReason,
        event?: Event,
        pressed?: HTMLElement | null,
        options: {
            payload?: { value: unknown };
            /** It moves to a trigger not rendered yet (a handle's `open(id)`). */
            movesUnrendered?: boolean;
        } = {},
    ): boolean {
        const before = pending ?? {
            open: open.value,
            trigger: trigger.value,
        };
        // a press on another trigger of the open overlay moves it there (not deduplicated)
        const moves =
            next &&
            before.open &&
            ((pressed != null && pressed !== before.trigger) ||
                options.movesUnrendered === true);
        if (before.open === next && !moves && options.payload === undefined) {
            return false;
        }
        const { details, held } = createOpenChangeDetails(
            reason,
            event,
            options.movesUnrendered === true
                ? undefined
                : (pressed ?? trigger.value) || undefined,
        );
        emit("openChange", next, details);
        if (details.isCanceled) {
            return false;
        }
        if (!next && held()) {
            presence.hold();
        }
        lastReason.current = reason;
        requested = next;
        pending = {
            open: next,
            trigger: next && pressed != null ? pressed : before.trigger,
        };
        if (next && pressed != null && pressed.id !== "") {
            if (props.triggerId === undefined) {
                ownTriggerId.value = pressed.id;
            }
            explicitPayload.value = null;
        }
        if (moves && options.movesUnrendered === true) {
            explicitPayload.value = null;
        }
        if (next && options.payload !== undefined) {
            explicitPayload.value = options.payload;
        }
        if (props.open === undefined) {
            own.value = next;
        }
        emit("update:open", next);
        // a request the consumer turned down is forgotten once it is answered
        queueMicrotask(() => {
            pending = null;
            requested = null;
        });
        return true;
    }

    // the handle's entry points (spec/README.md, "Detached triggers")
    const openFromHandle = (id: string | null) => {
        const element = id === null ? null : registry.get(id)?.element;
        if (id !== null && element === undefined) {
            // a trigger not rendered (yet): it becomes the active one when it registers; an overlay
            // open on another trigger moves to it, as a press on another trigger
            const isOpen = pending?.open ?? open.value;
            if (
                setOpen(true, "imperative-action", undefined, null, {
                    movesUnrendered: isOpen && requestedTriggerId.value !== id,
                }) &&
                props.triggerId === undefined
            ) {
                ownTriggerId.value = id;
            }
            return;
        }
        setOpen(true, "imperative-action", undefined, element);
    };
    const openWithPayload = (value: unknown) => {
        setOpen(true, "imperative-action", undefined, null, {
            payload: { value },
        });
    };
    const closeFromHandle = () => {
        setOpen(false, "imperative-action");
    };
    // what the Root exposes (a template ref on it: `root.close()`, `root.unmount()`)
    const actions: OverlayActions = {
        close: () => {
            setOpen(false, "imperative-action");
        },
        unmount: presence.finish,
    };

    const baseId = useId();
    return {
        open: open as Readonly<Ref<boolean>>,
        setOpen,
        lastReason,
        trigger,
        triggers,
        activeTriggerId,
        registerTrigger,
        payload,
        positioner,
        popup,
        presence,
        actions,
        openFromHandle,
        openWithPayload,
        closeFromHandle,
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
