import type { Signal } from "@angular/core";
import type {
    ToastManager,
    ToastObject,
    ToastOptions,
    ToastPromiseOptions,
} from "@fragiola/primitives/toast";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { ToastProvider } from "../directives/toast-provider.directive.ts";

/** The Provider's queue in a component (spec/toast.md, "The queue in a component"). */
export interface InjectedToastManager<Data = unknown> {
    /** The toasts, newest first. */
    toasts: Signal<readonly ToastObject<Data>[]>;
    add: (options: ToastOptions<Data>) => string;
    update: ToastManager<Data>["update"];
    close: (id?: string) => void;
    promise: <Value>(
        promise: Promise<Value>,
        options: ToastPromiseOptions<Value, Data>,
    ) => Promise<Value>;
}

/** The toast queue of the enclosing `[toastProvider]`, with its toasts (in an injection context). */
export function injectToastManager<
    Data = unknown,
>(): InjectedToastManager<Data> {
    const provider = injectEnclosing(
        ToastProvider,
        "toastProvider",
        "injectToastManager",
    );
    const manager = () => provider.manager() as ToastManager<Data>;
    return {
        toasts: provider.toasts as Signal<readonly ToastObject<Data>[]>,
        add: (options) => manager().add(options),
        update: (id, updates) => manager().update(id, updates),
        close: (id) => manager().close(id),
        promise: (promise, options) => manager().promise(promise, options),
    };
}
