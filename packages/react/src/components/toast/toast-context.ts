import type { ToastManager, ToastObject } from "@fragiola/primitives/toast";
import { createContext } from "react";

/** The Provider's queue, and its toasts as React renders them (spec/toast.md). */
export interface ToastProviderValue {
    manager: ToastManager<unknown>;
    toasts: readonly ToastObject<unknown>[];
}

export const ToastProviderContext = createContext<ToastProviderValue | null>(
    null,
);

/** What the Viewport shares with its toasts: the stack's state, and the focus off a closing one. */
export interface ToastViewportValue {
    expanded: boolean;
    focusAfterClose: (root: HTMLElement) => void;
}

export const ToastViewportContext = createContext<ToastViewportValue | null>(
    null,
);

/** One toast's context: its queue entry, its labels, and its close. */
export interface ToastRootValue {
    toast: ToastObject<unknown>;
    titleId: string | undefined;
    setTitleId: (id: string | undefined) => void;
    descriptionId: string | undefined;
    setDescriptionId: (id: string | undefined) => void;
    /** Closes this toast, moving a keyboard focus inside it to the next toast first. */
    close: () => void;
}

export const ToastRootContext = createContext<ToastRootValue | null>(null);
