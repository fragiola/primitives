import type {
    ToastManager,
    ToastObject,
    ToastOptions,
    ToastPromiseOptions,
} from "@fragiola/primitives/toast";
import type { Ref } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { ToastProviderKey } from "./toast-context.ts";

/** The Provider's queue in a component (spec/toast.md, "The queue in a component"). */
export interface UseToastManagerValue<Data = unknown> {
    /** The toasts, newest first. */
    toasts: Readonly<Ref<readonly ToastObject<Data>[]>>;
    add: (options: ToastOptions<Data>) => string;
    update: ToastManager<Data>["update"];
    close: (id?: string) => void;
    promise: <Value>(
        promise: Promise<Value>,
        options: ToastPromiseOptions<Value, Data>,
    ) => Promise<Value>;
}

/** The toast queue of the enclosing `Toast.Provider`, with its toasts. */
export function useToastManager<Data = unknown>(): UseToastManagerValue<Data> {
    const { manager, toasts } = useRequiredContext(
        ToastProviderKey,
        "Toast.Provider",
    );
    const queue = () => manager() as ToastManager<Data>;
    return {
        toasts: toasts as Readonly<Ref<readonly ToastObject<Data>[]>>,
        add: (options) => queue().add(options),
        update: (id, updates) => queue().update(id, updates),
        close: (id) => queue().close(id),
        promise: (promise, options) => queue().promise(promise, options),
    };
}
