import {
    afterRenderEffect,
    computed,
    Directive,
    inject,
    input,
    signal,
    untracked,
} from "@angular/core";
import {
    type SwipeDirection,
    swipeMovement,
    swipeRelease,
    watchSwipe,
} from "@fragiola/primitives/swipe";
import {
    measureToastHeight,
    type ToastObject,
} from "@fragiola/primitives/toast";
import {
    createPresence,
    dataValues,
    injectEnclosing,
    injectHost,
} from "@fragiola/primitives-angular/internal";
import { ToastProvider } from "./toast-provider.directive.ts";
import { ToastViewport } from "./toast-viewport.directive.ts";

export interface ToastRootState {
    type: string | undefined;
    expanded: boolean;
    limited: boolean;
    swiping: boolean;
    swipeDirection: SwipeDirection | undefined;
}

interface Swipe {
    swiping: boolean;
    direction: SwipeDirection | undefined;
    x: number;
    y: number;
}

const AT_REST: Swipe = { swiping: false, direction: undefined, x: 0, y: 0 };

/**
 * One toast (spec/toast.md): its presence, its measure, its swipe and Escape.
 * `<div toastRoot [toast]="toast">`, one per toast of the queue.
 */
@Directive({
    selector: "[toastRoot]",
    exportAs: "toastRoot",
    host: {
        "[attr.role]": "toast().priority === 'high' ? 'alertdialog' : 'dialog'",
        "aria-modal": "false",
        tabindex: "0",
        "data-primitives-part": "toast-root",
        "[attr.aria-labelledby]": "titleId() ?? null",
        "[attr.aria-describedby]": "descriptionId() ?? null",
        "[attr.inert]": "toast().limited ? '' : null",
        "[attr.data-type]": "data().type",
        "[attr.data-expanded]": "data().expanded",
        "[attr.data-limited]": "data().limited",
        "[attr.data-swiping]": "data().swiping",
        "[attr.data-swipe-direction]": "data().swipeDirection",
        "[attr.data-starting-style]": "data()['starting-style']",
        "[attr.data-ending-style]": "data()['ending-style']",
        "[style.--toast-index]": "toast().index",
        "[style.--toast-offset-y]": "toast().offsetY + 'px'",
        "[style.--toast-height]":
            "toast().height > 0 ? toast().height + 'px' : null",
        "[style.--toast-swipe-movement-x]": "swipe().x + 'px'",
        "[style.--toast-swipe-movement-y]": "swipe().y + 'px'",
        "(keydown)": "onKeyDown($event)",
    },
})
export class ToastRoot<Data = unknown> {
    /** The toast of the queue it renders. */
    readonly toast = input.required<ToastObject<Data>>();
    /** The edge a swipe dismisses it towards (default `right`). */
    readonly swipeDirection = input<SwipeDirection>("right");
    /** Its Title's id (the Root's `aria-labelledby`). */
    readonly titleId = signal<string | undefined>(undefined);
    /** Its Description's id (the Root's `aria-describedby`). */
    readonly descriptionId = signal<string | undefined>(undefined);
    protected readonly swipe = signal<Swipe>(AT_REST);

    private readonly provider = injectEnclosing(
        ToastProvider,
        "toastProvider",
        "toastRoot",
    );
    private readonly viewport = inject(ToastViewport, { optional: true });
    private readonly host = injectHost();
    private readonly open = computed(() => !this.toast().closing);
    private readonly presence = createPresence(this.open, signal(this.host), {
        onComplete: (open) => {
            if (!open) {
                this.provider.manager().remove(untracked(this.toast).id);
            }
        },
    });

    readonly state = computed<ToastRootState>(() => {
        const toast = this.toast();
        return {
            type: toast.type,
            expanded: this.viewport?.expanded() ?? false,
            limited: toast.limited,
            swiping: this.swipe().swiping,
            swipeDirection: this.swipe().direction,
        };
    });
    protected readonly data = computed(() => {
        const status = this.presence.status();
        return dataValues({
            ...this.state(),
            "starting-style": status === "starting",
            "ending-style": status === "ending",
        });
    });

    constructor() {
        // its natural height, on mount and on every update (spec/toast.md, "Stacking")
        afterRenderEffect(() => {
            const toast = this.toast();
            toast.updateKey;
            if (toast.closing) {
                return;
            }
            untracked(() =>
                this.provider
                    .manager()
                    .setHeight(toast.id, measureToastHeight(this.host)),
            );
        });

        afterRenderEffect((onCleanup) => {
            const closing = this.toast().closing;
            const direction = this.swipeDirection();
            if (closing) {
                return;
            }
            untracked(() => {
                const manager = this.provider.manager();
                const host = this.host;
                let ended = false;
                const stop = watchSwipe(host, {
                    directions: [direction],
                    onStart: () => {
                        manager.pause("swipe");
                        this.swipe.set({
                            ...AT_REST,
                            swiping: true,
                            direction,
                        });
                    },
                    onMove: (move) => {
                        const moved = swipeMovement(direction, move);
                        this.swipe.set({ swiping: true, direction, ...moved });
                    },
                    onEnd: (end) => {
                        manager.resume("swipe");
                        const size =
                            direction === "left" || direction === "right"
                                ? host.offsetWidth
                                : host.offsetHeight;
                        if (
                            end !== null &&
                            swipeRelease(direction, end, size).dismiss
                        ) {
                            ended = true;
                            this.swipe.update((current) => ({
                                ...current,
                                swiping: false,
                            }));
                            this.close();
                            return;
                        }
                        this.swipe.set(AT_REST);
                    },
                });
                onCleanup(() => {
                    stop();
                    if (!ended) {
                        manager.resume("swipe");
                    }
                });
            });
        });
    }

    /** Closes this toast, moving a keyboard focus inside it to the next toast first. */
    close(): void {
        this.viewport?.focusAfterClose(this.host);
        this.provider.manager().close(untracked(this.toast).id);
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.key === "Escape" && !event.defaultPrevented) {
            event.preventDefault();
            this.close();
        }
    }
}
