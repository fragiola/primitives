import {
    useCallback,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from "react";
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
    /**
     * Called before the open state changes; `details.cancel()` keeps it as it is (spec/README.md,
     * "Open change details").
     */
    onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
    /** Called once an opening or a closing transition has finished (spec/README.md, "Lifecycle"). */
    onOpenChangeComplete?: (open: boolean) => void;
    /** Receives the imperative actions: `close()` and `unmount()`. */
    actionsRef?: { current: OverlayActions | null };
}

/** The props of a Root with detached triggers (spec/README.md, "Detached triggers"). */
export interface OverlayTriggerRootProps {
    /** The id of the active trigger, controlled together with `open`. */
    triggerId?: string | null;
    defaultTriggerId?: string | null;
}

/** A Trigger the Root knows: its element and its current payload. */
interface TriggerEntry {
    element: HTMLElement;
    payload: () => unknown;
}

/**
 * The state every overlay root shares: open (controlled or not) with its last reason, the
 * triggers (the active one first), positioner and popup elements, ids, the presence of the popup
 * (mounted while its exit animation runs), the payload of detached triggers and the actions.
 *
 * `lastReason` is the reason of the change that made the current `open`: `null` when the
 * controlled `open` changed with no request of the overlay's own (a close the consumer made), so
 * a close never reuses an earlier change's reason for its focus return.
 *
 * `setOpen` calls `onOpenChange` before it changes the state and returns whether the change
 * happened (a canceled one, or one with nothing to change, did not).
 */
export function useOverlayRoot(
    props: OverlayRootProps & OverlayTriggerRootProps,
) {
    const [ownOpen, setOwnOpen] = useState(props.defaultOpen ?? false);
    const controlled = props.open !== undefined;
    const open = controlled ? (props.open as boolean) : ownOpen;

    // the triggers: one set through `setTrigger` (Select, Combobox, the pickers, a submenu), or
    // any number registered by their id (Dialog, Popover, Menu, Tooltip)
    const [singleTrigger, setTrigger] = useState<HTMLElement | null>(null);
    const registry = useRef(new Map<string, TriggerEntry>()).current;
    const [registryVersion, bumpRegistry] = useReducer(
        (count: number) => count + 1,
        0,
    );
    const registerTrigger = useCallback(
        (id: string, element: HTMLElement, payload: () => unknown) => {
            registry.set(id, { element, payload });
            bumpRegistry();
            return () => {
                if (registry.get(id)?.element === element) {
                    registry.delete(id);
                    bumpRegistry();
                }
            };
        },
        [registry],
    );
    const [ownTriggerId, setOwnTriggerId] = useState<string | null>(
        props.defaultTriggerId ?? null,
    );
    const requestedTriggerId =
        props.triggerId !== undefined ? props.triggerId : ownTriggerId;
    // an explicit payload (`openWithPayload`), else the active trigger's
    const [explicitPayload, setExplicitPayload] = useState<{
        value: unknown;
    } | null>(null);

    // the active trigger: the requested one, else the first registered, else the single one
    // biome-ignore lint/correctness/useExhaustiveDependencies: the registry is read through its version
    const active = useMemo(() => {
        const requested =
            requestedTriggerId === null
                ? undefined
                : registry.get(requestedTriggerId);
        if (requested !== undefined && requestedTriggerId !== null) {
            return { id: requestedTriggerId, ...requested };
        }
        const first = registry.entries().next();
        if (first.done !== true) {
            const [id, entry] = first.value;
            return { id, ...entry };
        }
        return null;
    }, [requestedTriggerId, registry, registryVersion]);
    const trigger = active?.element ?? singleTrigger;
    const activeTriggerId = active?.id ?? singleTrigger?.id ?? null;
    // biome-ignore lint/correctness/useExhaustiveDependencies: the registry is read through its version
    const triggers = useMemo(() => {
        const all = [...registry.values()].map((entry) => entry.element);
        return singleTrigger ? [...all, singleTrigger] : all;
    }, [registry, registryVersion, singleTrigger]);
    const payload = explicitPayload ? explicitPayload.value : active?.payload();

    const [positioner, setPositioner] = useState<HTMLElement | null>(null);
    const [popup, setPopup] = useState<HTMLElement | null>(null);
    const lastReason = useRef<ChangeReason | null>(null);
    const requested = useRef<boolean | null>(null);
    const hold = useRef<() => void>(() => {});
    const latest = useRef({
        open,
        controlled,
        onOpenChange: props.onOpenChange,
        trigger,
        triggerControlled: props.triggerId !== undefined,
    });
    latest.current = {
        open,
        controlled,
        onOpenChange: props.onOpenChange,
        trigger,
        triggerControlled: props.triggerId !== undefined,
    };
    // the open state just reported, until the render it causes: a second report of the same change
    // in the same task (a popover's Tab-out, then its focus watch) is not repeated
    const pending = useRef<{
        open: boolean;
        trigger: HTMLElement | null;
    } | null>(null);

    const setOpen = useCallback(
        (
            next: boolean,
            reason: ChangeReason,
            event?: Event,
            pressed?: HTMLElement | null,
            options: { payload?: { value: unknown } } = {},
        ): boolean => {
            const current = latest.current;
            const before = pending.current ?? {
                open: current.open,
                trigger: current.trigger,
            };
            // a press on another trigger of the open overlay moves it there (not deduplicated)
            const moves =
                next &&
                before.open &&
                pressed != null &&
                pressed !== before.trigger;
            if (
                before.open === next &&
                !moves &&
                options.payload === undefined
            ) {
                return false;
            }
            const { details, held } = createOpenChangeDetails(
                reason,
                event,
                (pressed ?? current.trigger) || undefined,
            );
            current.onOpenChange?.(next, details);
            if (details.isCanceled) {
                return false;
            }
            if (!next && held()) {
                hold.current();
            }
            lastReason.current = reason;
            requested.current = next;
            pending.current = {
                open: next,
                trigger: next && pressed != null ? pressed : before.trigger,
            };
            if (next && pressed != null && pressed.id !== "") {
                if (!current.triggerControlled) {
                    setOwnTriggerId(pressed.id);
                }
                setExplicitPayload(null);
            }
            if (next && options.payload !== undefined) {
                setExplicitPayload(options.payload);
            }
            if (!current.controlled) {
                setOwnOpen(next);
            }
            // after the updates above, whose render React runs in an earlier microtask: a request
            // the consumer turned down is forgotten once it is answered
            queueMicrotask(() => {
                pending.current = null;
                requested.current = null;
            });
            return true;
        },
        [],
    );
    // before the popup's effects end its session (and read the reason)
    useLayoutEffect(() => {
        if (requested.current !== open) {
            lastReason.current = null;
        }
        requested.current = null;
    }, [open]);
    const presence = usePresence(open, () => popup, {
        onComplete: props.onOpenChangeComplete,
    });
    hold.current = presence.hold;
    const { finish } = presence;
    useImperativeHandle(
        props.actionsRef,
        () => ({
            close: () => {
                setOpen(false, "imperative-action");
            },
            unmount: finish,
        }),
        [setOpen, finish],
    );

    // the handle's entry points (spec/README.md, "Detached triggers")
    const openFromHandle = useCallback(
        (id: string | null) => {
            const element = id === null ? null : registry.get(id)?.element;
            if (id !== null && element === undefined) {
                // a trigger not rendered (yet): it becomes the active one when it registers
                if (
                    setOpen(true, "imperative-action") &&
                    !latest.current.triggerControlled
                ) {
                    setOwnTriggerId(id);
                }
                return;
            }
            setOpen(true, "imperative-action", undefined, element);
        },
        [registry, setOpen],
    );
    const openWithPayload = useCallback(
        (value: unknown) => {
            setOpen(true, "imperative-action", undefined, null, {
                payload: { value },
            });
        },
        [setOpen],
    );
    const closeFromHandle = useCallback(
        () => setOpen(false, "imperative-action"),
        [setOpen],
    );

    const baseId = useId();
    const value = useMemo(
        () => ({
            open,
            setOpen,
            lastReason,
            trigger,
            setTrigger,
            triggers,
            activeTriggerId,
            registerTrigger,
            payload,
            positioner,
            setPositioner,
            popup,
            setPopup,
            presence,
            triggerId: `${baseId}-trigger`,
            popupId: `${baseId}-popup`,
            openFromHandle,
            openWithPayload,
            closeFromHandle,
        }),
        [
            open,
            setOpen,
            trigger,
            triggers,
            activeTriggerId,
            registerTrigger,
            payload,
            positioner,
            popup,
            presence,
            baseId,
            openFromHandle,
            openWithPayload,
            closeFromHandle,
        ],
    );
    return value;
}

export type OverlayRoot = ReturnType<typeof useOverlayRoot>;
