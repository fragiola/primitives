import {
    computed,
    effect,
    type OutputEmitterRef,
    type Signal,
    signal,
    untracked,
} from "@angular/core";
import {
    type ChangeReason,
    createOpenChangeDetails,
    type OpenChangeEvent,
} from "./change-details.ts";
import { injectFlush } from "./flush.ts";
import { injectId } from "./inject-id.ts";
import { createPresence } from "./presence.ts";

/** The inputs and outputs every overlay root directive declares (spec/README.md, "Overlays"). */
export interface OverlayRootInputs {
    open: Signal<boolean | undefined>;
    openChange: Pick<OutputEmitterRef<boolean>, "emit">;
    defaultOpen: Signal<boolean>;
    /** `(openChangeComplete)`: an opening's or a closing's transition finished. */
    openChangeComplete?: Pick<OutputEmitterRef<boolean>, "emit">;
    /** The active trigger's id, controlled together with `open` (detached triggers). */
    triggerId?: Signal<string | null | undefined>;
    defaultTriggerId?: Signal<string | null | undefined>;
}

/** A trigger the root knows: its element and its payload. */
interface TriggerEntry {
    element: HTMLElement;
    payload: Signal<unknown>;
}

/** The options of one `setOpen` call. */
export interface SetOpenOptions {
    /** An explicit payload (a handle's `openWithPayload`). */
    payload?: { value: unknown };
}

/**
 * The state every overlay root shares: open (bound or its own) with its last reason, the
 * triggers (one set through `singleTrigger`, or any number registered by their id), the active
 * trigger, its payload, the positioner and popup elements, ids, the presence of the popup (mounted
 * while its exit animation runs), and the handle's and the actions' entry points. Created in a root
 * directive's injection context.
 *
 * `setOpen` emits `openChangeDetails` before it changes the state, and returns whether the change
 * happened (a canceled one, or one with nothing to change, did not); it is called from event
 * handlers, and renders the change at once (`injectFlush`).
 *
 * `lastReason` is the reason of the change that made the current `open`: `null` when the bound
 * `open` changed with no request of the overlay's own (a close the consumer made), so a close
 * never reuses an earlier change's reason for its focus return.
 */
export function createOverlayRoot(
    inputs: OverlayRootInputs,
    emit: (event: OpenChangeEvent) => void,
    prefix: string,
) {
    // the open state: bound, else its own, seeded once by `defaultOpen` (read on first use, after
    // the inputs are set)
    let seed: { value: boolean } | null = null;
    const own = signal<{ value: boolean } | null>(null);
    const open = computed(() => {
        const bound = inputs.open();
        if (bound !== undefined) {
            return bound;
        }
        const local = own();
        if (local !== null) {
            return local.value;
        }
        seed ??= { value: untracked(inputs.defaultOpen) };
        return seed.value;
    });

    // the triggers: one set through `singleTrigger` (Select, Combobox, the pickers, a submenu), or
    // any number registered by their id (Dialog, Popover, Menu, Tooltip)
    const singleTrigger = signal<HTMLElement | null>(null);
    const registry = signal<ReadonlyMap<string, TriggerEntry>>(new Map());
    let triggerSeed: { value: string | null } | null = null;
    const ownTriggerId = signal<{ value: string | null } | null>(null);
    const requestedTriggerId = computed(() => {
        const bound = inputs.triggerId?.();
        if (bound !== undefined) {
            return bound;
        }
        const local = ownTriggerId();
        if (local !== null) {
            return local.value;
        }
        triggerSeed ??= {
            value: untracked(() => inputs.defaultTriggerId?.()) ?? null,
        };
        return triggerSeed.value;
    });
    // the active trigger: the requested one, else the first registered
    const active = computed(() => {
        const entries = registry();
        const requested = requestedTriggerId();
        const entry = requested === null ? undefined : entries.get(requested);
        if (entry !== undefined && requested !== null) {
            return { id: requested, ...entry };
        }
        const first = entries.entries().next();
        if (first.done !== true) {
            const [id, found] = first.value;
            return { id, ...found };
        }
        return null;
    });
    const trigger = computed(
        () => active()?.element ?? singleTrigger() ?? null,
    );
    // a single trigger's id once it has one (its directive writes it while rendering)
    const activeTriggerId = computed(
        () => active()?.id ?? (singleTrigger()?.id || null),
    );
    const triggers = computed(() => {
        const all = [...registry().values()].map((entry) => entry.element);
        const single = singleTrigger();
        return single ? [...all, single] : all;
    });
    // an explicit payload (`openWithPayload`), else the active trigger's
    const explicitPayload = signal<{ value: unknown } | null>(null);
    const payload = computed(() => {
        const explicit = explicitPayload();
        return explicit ? explicit.value : active()?.payload();
    });

    const positioner = signal<HTMLElement | null>(null);
    const popup = signal<HTMLElement | null>(null);
    const lastReason: { current: ChangeReason | null } = { current: null };
    let requested: boolean | null = null;
    // the open state just reported, until the microtask after it: a second report of the same
    // change in the same task (a popover's Tab-out, then its focus watch) is not repeated
    let pending: { open: boolean; trigger: HTMLElement | null } | null = null;
    // before rendering, so before the popup's after-render effects end its session
    effect(() => {
        const value = open();
        untracked(() => {
            if (requested !== value) {
                lastReason.current = null;
            }
            requested = null;
        });
    });
    const presence = createPresence(open, popup, {
        onComplete: (value) => inputs.openChangeComplete?.emit(value),
    });
    const id = injectId(prefix);
    const flush = injectFlush();

    const setOpen = (
        next: boolean,
        reason: ChangeReason,
        event?: Event,
        pressed?: HTMLElement | null,
        options: SetOpenOptions = {},
    ): boolean => {
        const current = untracked(open);
        const before = pending ?? {
            open: current,
            trigger: untracked(trigger),
        };
        // a press on another trigger of the open overlay moves it there (not deduplicated)
        const moves =
            next &&
            before.open &&
            pressed != null &&
            pressed !== before.trigger;
        if (before.open === next && !moves && options.payload === undefined) {
            return false;
        }
        const { details, held } = createOpenChangeDetails(
            reason,
            event,
            (pressed ?? untracked(trigger)) || undefined,
        );
        emit({ open: next, details });
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
            if (untracked(() => inputs.triggerId?.()) === undefined) {
                ownTriggerId.set({ value: pressed.id });
            }
            explicitPayload.set(null);
        }
        if (next && options.payload !== undefined) {
            explicitPayload.set(options.payload);
        }
        if (untracked(inputs.open) === undefined) {
            own.set({ value: next });
        }
        if (current !== next) {
            inputs.openChange.emit(next);
        }
        // a request the consumer turned down is forgotten once it is answered
        queueMicrotask(() => {
            pending = null;
            requested = null;
        });
        // the popup (and its focus) or the focus return, before the next event
        flush();
        return true;
    };

    return {
        open,
        setOpen,
        lastReason,
        /** The active trigger: the registered one, else the single one. */
        trigger,
        /** The trigger of an overlay with one trigger (`registerHost(overlay.singleTrigger)`). */
        singleTrigger,
        /** Every trigger of the overlay (its layer's `ignore` and `owner`). */
        triggers,
        activeTriggerId,
        /** The payload of the active trigger (or of `openWithPayload`). */
        payload,
        /** Registers a trigger by its id while it lives; returns its unregistration. */
        registerTrigger: (
            triggerId: string,
            element: HTMLElement,
            triggerPayload: Signal<unknown>,
        ): (() => void) => {
            registry.update((entries) =>
                new Map(entries).set(triggerId, {
                    element,
                    payload: triggerPayload,
                }),
            );
            return () => {
                if (untracked(registry).get(triggerId)?.element === element) {
                    registry.update((entries) => {
                        const next = new Map(entries);
                        next.delete(triggerId);
                        return next;
                    });
                }
            };
        },
        positioner,
        popup,
        presence,
        /** The id of a single trigger with none of its own. */
        triggerId: `${id}-trigger`,
        popupId: `${id}-popup`,
        // the handle's entry points (spec/README.md, "Detached triggers")
        openFromHandle: (triggerId: string | null) => {
            const element =
                triggerId === null
                    ? null
                    : untracked(registry).get(triggerId)?.element;
            if (triggerId !== null && element === undefined) {
                // a trigger not rendered (yet): it becomes the active one when it registers
                if (
                    setOpen(true, "imperative-action") &&
                    untracked(() => inputs.triggerId?.()) === undefined
                ) {
                    ownTriggerId.set({ value: triggerId });
                }
                return;
            }
            setOpen(true, "imperative-action", undefined, element);
        },
        openWithPayload: (value: unknown) => {
            setOpen(true, "imperative-action", undefined, null, {
                payload: { value },
            });
        },
        closeFromHandle: () => {
            setOpen(false, "imperative-action");
        },
        // the actions (spec/README.md, "Lifecycle")
        close: () => {
            setOpen(false, "imperative-action");
        },
        unmount: () => presence.finish(),
    };
}

export type OverlayRoot = ReturnType<typeof createOverlayRoot>;
