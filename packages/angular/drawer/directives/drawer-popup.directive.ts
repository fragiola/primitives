import {
    afterRenderEffect,
    computed,
    Directive,
    effect,
    inject,
    signal,
    untracked,
} from "@angular/core";
import {
    type ResolvedSnapPoint,
    resolveSnapPoints,
    swipeMovement,
    swipeProgress,
    swipeRelease,
    watchSwipe,
} from "@fragiola/primitives/swipe";
import {
    DIALOG_NESTING,
    DialogPopup,
    DialogRootBase,
} from "@fragiola/primitives-angular/dialog";
import { injectHost } from "@fragiola/primitives-angular/internal";
import { DrawerRoot } from "./drawer-root.directive.ts";

export interface DrawerPopupState {
    open: boolean;
    nested: boolean;
    nestedDrawerOpen: boolean;
    swiping: boolean;
    swipeDirection: string;
    expanded: boolean;
}

interface Sizes {
    popupHeight: number;
    popupWidth: number;
    viewportHeight: number;
    rootFontSize: number;
}

const NO_SIZES: Sizes = {
    popupHeight: 0,
    popupWidth: 0,
    viewportHeight: 0,
    rootFontSize: 16,
};

/**
 * The drawer's dialog (spec/drawer.md): Dialog's Popup, plus the swipe (`watchSwipe` on it), the
 * snap point offset and the movement variables. `<div drawerPopup>`.
 */
@Directive({
    selector: "[drawerPopup]",
    exportAs: "drawerPopup",
    providers: [
        {
            provide: DIALOG_NESTING,
            useFactory: () => inject<DialogRootBase>(DialogRootBase).nesting,
        },
    ],
    host: {
        "[style.--drawer-swipe-movement-x]": "movement().x + 'px'",
        "[style.--drawer-swipe-movement-y]": "movement().y + 'px'",
        "[style.--drawer-snap-point-offset]": "snapOffsetValue()",
        "[style.--drawer-swipe-progress]": "drawer.swipe().progress",
        "[attr.data-swipe-direction]": "drawer.swipeDirection()",
        "[attr.data-swiping]": "swiping() ? '' : null",
        "[attr.data-swipe-dismiss]":
            "dismissed() && !drawer.overlay.open() ? '' : null",
        "[attr.data-expanded]": "offset() === 0 ? '' : null",
    },
})
export class DrawerPopup extends DialogPopup {
    protected readonly drawer = inject<DrawerRoot<unknown>>(DrawerRoot);
    protected readonly movement = signal({ x: 0, y: 0 });
    protected readonly swiping = signal(false);
    protected readonly dismissed = signal(false);
    private readonly sizes = signal<Sizes>(NO_SIZES);
    private readonly vertical = computed(() => {
        const direction = this.drawer.swipeDirection();
        return direction === "up" || direction === "down";
    });
    private readonly points = computed<ResolvedSnapPoint[]>(() => {
        const snapPoints = this.drawer.snapPoints();
        return snapPoints === undefined || !this.vertical()
            ? []
            : resolveSnapPoints(snapPoints, this.sizes());
    });
    protected readonly offset = computed(() => {
        const points = this.points();
        const active = this.drawer.activeSnapPoint();
        const point =
            points.find((candidate) => Object.is(candidate.value, active)) ??
            points[0];
        return point?.offset ?? 0;
    });
    protected readonly snapOffsetValue = computed(
        () =>
            `${this.offset() * (this.drawer.swipeDirection() === "up" ? -1 : 1)}px`,
    );
    readonly drawerState = computed<DrawerPopupState>(() => ({
        open: this.drawer.overlay.open(),
        nested: this.drawer.nested,
        nestedDrawerOpen: this.drawer.nestedDialogs() > 0,
        swiping: this.swiping(),
        swipeDirection: this.drawer.swipeDirection(),
        expanded: this.offset() === 0,
    }));

    constructor() {
        super();
        const host = injectHost();
        const drawer = this.drawer;
        const overlay = drawer.overlay;
        // an opening starts at rest
        effect(() => {
            if (overlay.open()) {
                untracked(() => {
                    this.movement.set({ x: 0, y: 0 });
                    this.swiping.set(false);
                    this.dismissed.set(false);
                });
            }
        });
        // the sizes the snap points are measured against, while it is shown
        afterRenderEffect((onCleanup) => {
            if (!overlay.open()) {
                return;
            }
            const viewport = drawer.viewport();
            untracked(() => {
                const doc = host.ownerDocument;
                const measure = () => {
                    const fontSize = Number.parseFloat(
                        doc.defaultView?.getComputedStyle(doc.documentElement)
                            .fontSize ?? "",
                    );
                    const next = {
                        popupHeight: host.offsetHeight,
                        popupWidth: host.offsetWidth,
                        viewportHeight:
                            viewport?.offsetHeight ||
                            doc.documentElement.clientHeight,
                        rootFontSize: Number.isFinite(fontSize) ? fontSize : 16,
                    };
                    const previous = this.sizes();
                    if (
                        previous.popupHeight !== next.popupHeight ||
                        previous.popupWidth !== next.popupWidth ||
                        previous.viewportHeight !== next.viewportHeight ||
                        previous.rootFontSize !== next.rootFontSize
                    ) {
                        this.sizes.set(next);
                    }
                };
                measure();
                const View = doc.defaultView?.ResizeObserver;
                if (View === undefined) {
                    return;
                }
                const observer = new View(measure);
                observer.observe(host);
                if (viewport) {
                    observer.observe(viewport);
                }
                onCleanup(() => observer.disconnect());
            });
        });
        // the swipe, while it is open
        afterRenderEffect((onCleanup) => {
            const open = overlay.open();
            const direction = drawer.swipeDirection();
            const vertical = this.vertical();
            if (!open) {
                return;
            }
            untracked(() => {
                const size = () => {
                    const sizes = this.sizes();
                    return vertical
                        ? sizes.popupHeight || host.offsetHeight
                        : sizes.popupWidth || host.offsetWidth;
                };
                const settle = () => {
                    this.swiping.set(false);
                    this.movement.set({ x: 0, y: 0 });
                    drawer.swipe.set({ swiping: false, progress: 0 });
                };
                const stop = watchSwipe(host, {
                    directions: [direction],
                    // the mouse selects the Content's text (spec/drawer.md, "Swipe")
                    canStart: (target, event) =>
                        event.pointerType !== "mouse" ||
                        target.closest(
                            '[data-primitives-part="drawer-content"]',
                        ) === null,
                    onStart: () => this.swiping.set(true),
                    onMove: (move) => {
                        const base = this.offset();
                        this.movement.set(swipeMovement(direction, move, base));
                        drawer.swipe.set({
                            swiping: true,
                            progress: swipeProgress(
                                direction,
                                move,
                                size(),
                                base,
                            ),
                        });
                    },
                    onEnd: (end, event) => {
                        if (end === null) {
                            settle();
                            return;
                        }
                        const points = this.points();
                        const outcome = swipeRelease(
                            direction,
                            end,
                            size(),
                            points.length > 0
                                ? { points, currentOffset: this.offset() }
                                : undefined,
                        );
                        if (outcome.dismiss) {
                            this.swiping.set(false);
                            this.dismissed.set(true);
                            drawer.swipe.set({ swiping: false, progress: 1 });
                            if (
                                !overlay.setOpen(
                                    false,
                                    "swipe",
                                    event ?? undefined,
                                )
                            ) {
                                this.dismissed.set(false);
                                settle();
                            }
                            return;
                        }
                        if (outcome.snapPoint !== null) {
                            const point = points[outcome.snapPoint];
                            if (point !== undefined) {
                                drawer.setSnapPoint(point.value, {
                                    reason: "swipe",
                                    event: event ?? undefined,
                                });
                            }
                        }
                        settle();
                    },
                });
                onCleanup(stop);
            });
        });
    }
}
