import type { ToastManager, ToastObject } from "@fragiola/primitives/toast";
import {
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
    provide,
    shallowRef,
    watch,
} from "vue";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { createToastManager } from "./create-toast-manager.ts";
import { ToastProviderKey } from "./toast-context.ts";

/** Gives its parts the toast queue (spec/toast.md, "API"); renders no element. */
export interface ToastProviderProps {
    /** A queue the app created (for instance in a plain module); default: one of its own. */
    toastManager?: ToastManager<unknown>;
    /** How many toasts show at once (default `3`; given to a `toastManager` only when set). */
    limit?: number;
    /** The default ms before a toast closes (default `5000`; idem). */
    timeout?: number;
}

export const ToastProvider: PublicComponent<ToastProviderProps, ContentSlots> =
    publicComponent(
        defineComponent({
            name: "ToastProvider",
            props: {
                toastManager: {
                    type: Object as PropType<ToastManager<unknown>>,
                    default: undefined,
                },
                limit: { type: Number, default: undefined },
                timeout: { type: Number, default: undefined },
            },
            setup(props, { slots }) {
                // a queue of its own when none is given (created once)
                const own = createToastManager({
                    limit: props.limit,
                    timeout: props.timeout,
                });
                const manager = () => props.toastManager ?? own;
                watch(
                    () => [manager(), props.limit, props.timeout] as const,
                    ([queue, limit, timeout]) =>
                        queue.configure({ limit, timeout }),
                    { immediate: true },
                );
                const toasts = shallowRef<readonly ToastObject<unknown>[]>(
                    manager().toasts(),
                );
                // subscribed in the browser only: a server render never unmounts
                let unsubscribe = () => {};
                onMounted(() => {
                    watch(
                        manager,
                        (queue, _, onCleanup) => {
                            const sync = () => {
                                toasts.value = queue.toasts();
                            };
                            sync();
                            const stop = queue.subscribe(sync);
                            unsubscribe = stop;
                            onCleanup(stop);
                        },
                        { immediate: true },
                    );
                });
                onBeforeUnmount(() => unsubscribe());
                provide(ToastProviderKey, { manager, toasts });
                return () => slots.default?.();
            },
        }),
    );
