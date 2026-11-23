import {
    afterRenderEffect,
    computed,
    Directive,
    signal,
    untracked,
} from "@angular/core";
import {
    type ToastViewportWatch,
    watchToastViewport,
} from "@fragiola/primitives/toast";
import {
    dataValues,
    injectEnclosing,
    injectHost,
} from "@fragiola/primitives-angular/internal";
import { ToastProvider } from "./toast-provider.directive.ts";

export interface ToastViewportState {
    expanded: boolean;
}

/**
 * The `region` landmark of the toasts (spec/toast.md, "Viewport"): F6 reaches it, the pointer and
 * the keyboard in it pause the queue, and its live regions announce the toasts. The app names it:
 * `<div toastViewport aria-label="Notifications">`.
 */
@Directive({
    selector: "[toastViewport]",
    exportAs: "toastViewport",
    host: {
        role: "region",
        tabindex: "-1",
        "data-primitives-part": "toast-viewport",
        "[attr.data-expanded]": "data().expanded",
        "[style.--toast-frontmost-height]": "frontmost()",
    },
})
export class ToastViewport {
    private readonly provider = injectEnclosing(
        ToastProvider,
        "toastProvider",
        "toastViewport",
    );
    private readonly host = injectHost();
    private readonly expandedState = signal(false);
    /** Whether the pointer is over it or the keyboard is in it. */
    readonly expanded = this.expandedState.asReadonly();
    readonly state = computed<ToastViewportState>(() => ({
        expanded: this.expanded(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly frontmost = computed(() => {
        const height =
            this.provider.toasts().find((toast) => !toast.closing)?.height ?? 0;
        return height > 0 ? `${height}px` : null;
    });
    private watch: ToastViewportWatch | null = null;

    constructor() {
        afterRenderEffect((onCleanup) => {
            const manager = this.provider.manager();
            untracked(() => {
                const watched = watchToastViewport(this.host, manager, {
                    onExpandedChange: (expanded) =>
                        this.expandedState.set(expanded),
                });
                this.watch = watched;
                onCleanup(() => {
                    watched.stop();
                    this.watch = null;
                    this.expandedState.set(false);
                });
            });
        });
    }

    /** Moves a keyboard focus off a closing toast (spec/toast.md, "Focus"). */
    focusAfterClose(root: HTMLElement): void {
        this.watch?.focusAfterClose(root);
    }
}
