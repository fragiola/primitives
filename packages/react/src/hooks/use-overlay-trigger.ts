import {
    type Context,
    useContext,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";
import type {
    HandleBinding,
    HandleSlot,
    OverlayHandle,
    OverlayHandleStore,
} from "../utils/overlay-handle.ts";
import type { OverlayRoot } from "./use-overlay-root.ts";

const NO_SUBSCRIPTION = () => () => {};
const NONE = () => null;

/**
 * Attaches a Root to its handle while it is mounted (spec/README.md, "Detached triggers"): once,
 * on top of the Roots already attached, and keeps the handle's view of its context value current
 * without attaching it again (which would take the handle from a Root attached later).
 */
export function useAttachHandle(
    handle: OverlayHandle<never> | undefined,
    binding: HandleBinding,
): void {
    const slot = useRef<HandleSlot | null>(null);
    if (slot.current === null) {
        slot.current = { binding };
    }
    const own = slot.current;
    const store = handle as OverlayHandleStore<never> | undefined;
    // before the attachment on the first commit: a new value of a Root not yet attached waits
    useLayoutEffect(() => {
        store?.update(own, binding);
    }, [store, own, binding]);
    useLayoutEffect(() => {
        if (store === undefined) {
            return undefined;
        }
        store.attach(own);
        return () => store.detach(own);
    }, [store, own]);
}

/** The props every Trigger of an overlay with detached triggers takes. */
export interface OverlayTriggerProps<Handle, Payload> {
    /** The handle of a Root this Trigger opens from anywhere (spec/README.md, "Detached triggers"). */
    handle?: Handle;
    /** What the Root's content receives while this Trigger is the active one. */
    payload?: Payload;
    /** The Trigger's id (generated when not given): `triggerId` and the handle's `open` name it. */
    id?: string;
}

/**
 * A Trigger of an overlay with detached triggers: its Root's context (the enclosing Root's, or
 * the one attached to its `handle`, `null` until that Root is attached), its id, its registration
 * with the Root and whether it is the active trigger of the open overlay.
 */
export function useOverlayTrigger<Value extends OverlayRoot>(
    context: Context<Value | null>,
    name: string,
    props: {
        handle?: OverlayHandle<never> | undefined;
        payload?: unknown;
        id?: string | undefined;
    },
) {
    const enclosing = useContext(context);
    const handle = props.handle as OverlayHandleStore<never> | undefined;
    const bound = useSyncExternalStore(
        handle?.subscribe ?? NO_SUBSCRIPTION,
        handle ? handle.getBinding : NONE,
        NONE,
    ) as Value | null;
    if (handle === undefined && enclosing === null) {
        throw new Error(`<${name}> must be inside its Root, or have a handle.`);
    }
    const root = handle === undefined ? enclosing : bound;
    const generated = useId();
    const id = props.id ?? generated;
    const [element, setElement] = useState<HTMLElement | null>(null);
    const payload = useRef(props.payload);
    payload.current = props.payload;
    const register = root?.registerTrigger;
    useLayoutEffect(() => {
        if (register === undefined || element === null) {
            return undefined;
        }
        return register(id, element, () => payload.current);
    }, [register, id, element]);
    // the Root reads the payload while it renders: a new one renders it again (when active)
    const refresh = root?.refreshPayload;
    const reported = useRef(props.payload);
    useLayoutEffect(() => {
        if (Object.is(reported.current, props.payload)) {
            return;
        }
        reported.current = props.payload;
        refresh?.(id);
    }, [props.payload, refresh, id]);
    const active = root?.open === true && root.activeTriggerId === id;
    return { root, id, element, ref: setElement, active };
}
