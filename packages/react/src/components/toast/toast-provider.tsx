import type { ToastManager } from "@fragiola/primitives/toast";
import {
    type ReactNode,
    useLayoutEffect,
    useMemo,
    useState,
    useSyncExternalStore,
} from "react";
import { createToastManager } from "./create-toast-manager.ts";
import { ToastProviderContext } from "./toast-context.ts";

export interface ToastProviderProps {
    /** A queue the app created (for instance in a plain module); default: one of its own. */
    toastManager?: ToastManager<unknown>;
    /** How many toasts show at once (default `3`; given to a `toastManager` only when set). */
    limit?: number;
    /** The default ms before a toast closes (default `5000`; idem). */
    timeout?: number;
    children?: ReactNode;
}

/** Gives its parts the toast queue (spec/toast.md, "API"); renders no element. */
export function ToastProvider({
    toastManager,
    limit,
    timeout,
    children,
}: ToastProviderProps) {
    // a queue of its own when none is given (created once, even if one is given later)
    const [own] = useState(() => createToastManager({ limit, timeout }));
    const manager = toastManager ?? own;
    useLayoutEffect(() => {
        manager.configure({ limit, timeout });
    }, [manager, limit, timeout]);
    const toasts = useSyncExternalStore(
        manager.subscribe,
        manager.toasts,
        manager.toasts,
    );
    const value = useMemo(() => ({ manager, toasts }), [manager, toasts]);
    return (
        <ToastProviderContext.Provider value={value}>
            {children}
        </ToastProviderContext.Provider>
    );
}
