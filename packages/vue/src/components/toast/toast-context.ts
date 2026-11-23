import type { ToastManager, ToastObject } from "@fragiola/primitives/toast";
import type { InjectionKey, Ref, ShallowRef } from "vue";

/** The Provider's queue, and its toasts as Vue renders them (spec/toast.md). */
export interface ToastProviderContext {
    manager: () => ToastManager<unknown>;
    toasts: ShallowRef<readonly ToastObject<unknown>[]>;
}

export const ToastProviderKey: InjectionKey<ToastProviderContext> =
    Symbol("ToastProvider");

/** What the Viewport shares with its toasts: the stack's state, and the focus off a closing one. */
export interface ToastViewportContext {
    expanded: Ref<boolean>;
    focusAfterClose: (root: HTMLElement) => void;
}

export const ToastViewportKey: InjectionKey<ToastViewportContext> =
    Symbol("ToastViewport");

/** One toast's context: its queue entry, its labels, and its close. */
export interface ToastRootContext {
    toast: () => ToastObject<unknown>;
    titleId: Ref<string | undefined>;
    descriptionId: Ref<string | undefined>;
    /** Closes this toast, moving a keyboard focus inside it to the next toast first. */
    close: () => void;
}

export const ToastRootKey: InjectionKey<ToastRootContext> = Symbol("ToastRoot");
