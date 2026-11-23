import type {
    ToastManager,
    ToastObject,
    ToastOptions,
    ToastPromiseOptions,
} from "@fragiola/primitives/toast";
import { useMemo } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { ToastProviderContext } from "./toast-context.ts";

/** The Provider's queue in a component (spec/toast.md, "The queue in a component"). */
export interface UseToastManagerValue<Data = unknown> {
    /** The toasts, newest first; a change renders again. */
    toasts: readonly ToastObject<Data>[];
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
        ToastProviderContext,
        "Toast.Provider",
    );
    const queue = manager as ToastManager<Data>;
    return useMemo(
        () => ({
            toasts: toasts as readonly ToastObject<Data>[],
            add: queue.add,
            update: queue.update,
            close: queue.close,
            promise: queue.promise,
        }),
        [queue, toasts],
    );
}
