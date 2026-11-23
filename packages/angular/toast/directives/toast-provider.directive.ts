import {
    computed,
    Directive,
    effect,
    input,
    signal,
    untracked,
} from "@angular/core";
import type { ToastManager, ToastObject } from "@fragiola/primitives/toast";
import { createToastManager } from "../utils/create-toast-manager.ts";

/**
 * Gives its parts the toast queue (spec/toast.md, "API"); renders no element:
 * `<ng-container toastProvider [toastManager]="notifications">`.
 */
@Directive({ selector: "[toastProvider]", exportAs: "toastProvider" })
export class ToastProvider {
    /** A queue the app created (for instance in a plain module); default: one of its own. */
    readonly toastManager = input<ToastManager<unknown> | undefined>(undefined);
    /** How many toasts show at once (default `3`; given to a `toastManager` only when set). */
    readonly limit = input<number | undefined>(undefined);
    /** The default ms before a toast closes (default `5000`; idem). */
    readonly timeout = input<number | undefined>(undefined);

    // a queue of its own when none is given, with the first inputs it got
    private own: ToastManager<unknown> | null = null;
    /** The queue its parts render. */
    readonly manager = computed<ToastManager<unknown>>(() => {
        const given = this.toastManager();
        if (given !== undefined) {
            return given;
        }
        this.own ??= createToastManager({
            limit: untracked(this.limit),
            timeout: untracked(this.timeout),
        });
        return this.own;
    });
    private readonly list = signal<readonly ToastObject<unknown>[]>([]);
    /** The toasts, newest first. */
    readonly toasts = this.list.asReadonly();

    constructor() {
        effect((onCleanup) => {
            const manager = this.manager();
            untracked(() => {
                this.list.set(manager.toasts());
                onCleanup(
                    manager.subscribe(() => this.list.set(manager.toasts())),
                );
            });
        });
        effect(() => {
            const manager = this.manager();
            const limit = this.limit();
            const timeout = this.timeout();
            untracked(() => manager.configure({ limit, timeout }));
        });
    }
}
