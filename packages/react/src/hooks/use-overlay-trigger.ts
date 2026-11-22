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
    OverlayHandle,
    OverlayHandleStore,
} from "../utils/overlay-handle.ts";
import type { OverlayRoot } from "./use-overlay-root.ts";

const NO_SUBSCRIPTION = () => () => {};
const NONE = () => null;

/** Attaches a Root's context value to its handle while it is mounted. */
export function useAttachHandle(
    handle: OverlayHandle<never> | undefined,
    binding: HandleBinding,
): void {
    useLayoutEffect(() => {
        if (handle === undefined) {
            return undefined;
        }
        const store = handle as OverlayHandleStore<never>;
        store.attach(binding);
        return () => store.detach(binding);
    }, [handle, binding]);
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
    const active = root?.open === true && root.activeTriggerId === id;
    return { root, id, element, ref: setElement, active };
}
