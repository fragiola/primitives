import {
    computed,
    type InjectionKey,
    inject,
    type PropType,
    shallowRef,
    useId,
    watch,
} from "vue";
import type {
    HandleBinding,
    OverlayHandle,
    OverlayHandleStore,
} from "../utils/overlay-handle.ts";
import type { OverlayRoot } from "./use-overlay-root.ts";

/** The props every Trigger of an overlay with detached triggers takes. */
export interface OverlayTriggerProps<Handle, Payload> {
    /** The handle of a Root this Trigger opens from anywhere (spec/README.md, "Detached triggers"). */
    handle?: Handle;
    /** What the Root's content receives while this Trigger is the active one. */
    payload?: Payload;
    /** The Trigger's id (generated when not given): `trigger-id` and the handle's `open` name it. */
    id?: string;
}

export const overlayTriggerProps = {
    handle: {
        type: Object as PropType<OverlayHandle<never>>,
        default: undefined,
    },
    payload: { type: null as unknown as PropType<unknown>, default: undefined },
    id: { type: String, default: undefined },
};

/** Attaches a Root's context to its handle while it is mounted (the watcher stops on unmount). */
export function useAttachHandle(
    handle: () => OverlayHandle<never> | undefined,
    binding: HandleBinding,
): void {
    watch(
        handle,
        (current, _, onCleanup) => {
            if (current === undefined) {
                return;
            }
            const store = current as OverlayHandleStore<never>;
            store.attach(binding);
            onCleanup(() => store.detach(binding));
        },
        { immediate: true, flush: "sync" },
    );
}

/**
 * A Trigger of an overlay with detached triggers: its Root's context (the enclosing Root's, or
 * the one attached to its `handle`, `null` until that Root is attached), its id, its registration
 * with the Root and whether it is the active trigger of the open overlay.
 */
export function useOverlayTrigger<Context extends OverlayRoot>(
    key: InjectionKey<Context>,
    name: string,
    props: {
        handle?: OverlayHandle<never> | undefined;
        payload?: unknown;
        id?: string | undefined;
    },
) {
    const enclosing = inject(key, null);
    if (props.handle === undefined && enclosing === null) {
        throw new Error(`<${name}> must be inside its Root, or have a handle.`);
    }
    const root = computed(() =>
        props.handle === undefined
            ? enclosing
            : ((
                  props.handle as OverlayHandleStore<never>
              ).getBinding() as Context | null),
    );
    const generated = useId();
    const id = computed(() => props.id ?? generated);
    const element = shallowRef<HTMLElement | null>(null);
    watch(
        () => [root.value, id.value, element.value] as const,
        ([current, currentId, node], _, onCleanup) => {
            if (current === null || node === null) {
                return;
            }
            onCleanup(
                current.registerTrigger(currentId, node, () => props.payload),
            );
        },
        { immediate: true, flush: "sync" },
    );
    const active = computed(
        () =>
            root.value?.open.value === true &&
            root.value.activeTriggerId.value === id.value,
    );
    return { root, id, element, active };
}
