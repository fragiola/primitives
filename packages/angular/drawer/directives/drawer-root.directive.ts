import {
    computed,
    Directive,
    effect,
    forwardRef,
    input,
    output,
    signal,
    untracked,
} from "@angular/core";
import type { SnapPoint, SwipeDirection } from "@fragiola/primitives/swipe";
import { DialogRootBase } from "@fragiola/primitives-angular/dialog";
import {
    attachHandle,
    type ChangeDetails,
    controllable,
    type OpenChangeEvent,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
import type { DrawerHandle } from "../utils/drawer-handle.ts";

/** A swipe's state, which the Popup sets and the Backdrop and Viewport read (spec/drawer.md). */
export interface DrawerSwipeState {
    swiping: boolean;
    /** From `0` to `1`: how far it moved towards closed (`--drawer-swipe-progress`). */
    progress: number;
}

const AT_REST: DrawerSwipeState = { swiping: false, progress: 0 };

/**
 * Holds the drawer's state (spec/drawer.md); adds nothing to its element:
 * `<ng-container drawerRoot [(open)]="open" swipeDirection="right" [snapPoints]="points"
 * [(snapPoint)]="point">`. Its parts are Dialog's directives, named `drawer-*`, plus the swipe and
 * the snap points. Its `payload()` is the active trigger's payload (`#drawer="drawerRoot"`);
 * `close()` and `unmount()` are its actions.
 */
@Directive({
    selector: "[drawerRoot]",
    exportAs: "drawerRoot",
    providers: [
        {
            provide: DialogRootBase,
            useExisting: forwardRef(() => DrawerRoot),
        },
    ],
})
export class DrawerRoot<Payload = unknown> extends DialogRootBase<Payload> {
    /** The open state: two-way `[(open)]`, one-way `[open]`, or the drawer's own. */
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    /**
     * Every requested change of the open state with its details, before it happens
     * (`details.cancel()` keeps it; `(openChange)` emits the value alone, only when it happens).
     */
    readonly openChangeDetails = output<OpenChangeEvent>();
    /** An opening's or a closing's transition has finished (spec/README.md, "Lifecycle"). */
    readonly openChangeComplete = output<boolean>();
    /** Connects `[drawerTrigger]`s rendered outside the Root (spec/drawer.md, "Detached triggers"). */
    readonly handle = input<DrawerHandle<Payload> | undefined>(undefined);
    /** The id of the active trigger, controlled together with `open`. */
    readonly triggerId = input<string | null | undefined>(undefined);
    readonly defaultTriggerId = input<string | null>(null);
    /** The edge a swipe dismisses it towards (default `"down"`: a bottom sheet). */
    readonly swipeDirection = input<SwipeDirection>("down");
    /** The heights it rests at (spec/drawer.md, "Snap points"); vertical directions only. */
    readonly snapPoints = input<readonly SnapPoint[] | undefined>(undefined);
    /** The active snap point: two-way `[(snapPoint)]`, one-way `[snapPoint]`, or its own. */
    readonly snapPoint = input<SnapPoint | null | undefined>(undefined);
    readonly snapPointChange = output<SnapPoint | null>();
    /** The snap point it opens on, uncontrolled (default: the first of `snapPoints`). */
    readonly defaultSnapPoint = input<SnapPoint | null | undefined>(undefined);
    /** Every change of the snap point with its details (reason `swipe`, or `none`). */
    readonly snapPointChangeDetails =
        output<ValueChangeEvent<SnapPoint | null>>();
    readonly component = "drawer";

    private readonly initialSnapPoint = computed(
        () => this.defaultSnapPoint() ?? this.snapPoints()?.[0] ?? null,
    );
    private readonly snapping = controllable<SnapPoint | null, ChangeDetails>(
        this.snapPoint,
        this.snapPointChange,
        () => this.initialSnapPoint(),
        (value, details) =>
            this.snapPointChangeDetails.emit({ value, details }),
    );
    /** The active snap point (`null` without snap points). */
    readonly activeSnapPoint = computed(() =>
        this.snapPoints() === undefined ? null : this.snapping.value(),
    );
    /** The swipe's state, which the Popup sets. */
    readonly swipe = signal<DrawerSwipeState>(AT_REST);

    constructor() {
        super();
        attachHandle(this.handle, this);
        // an opening (the change of `open` to true, a controlled one included) starts at rest, on
        // the default snap point again (spec/drawer.md, "API"); a swipe's dismissal keeps its
        // progress while it exits
        let wasOpen = untracked(this.overlay.open);
        effect(() => {
            const open = this.overlay.open();
            untracked(() => {
                if (open === wasOpen) {
                    return;
                }
                wasOpen = open;
                if (!open) {
                    return;
                }
                this.swipe.set(AT_REST);
                const start = this.initialSnapPoint();
                if (!Object.is(start, this.snapping.value())) {
                    this.snapping.set(start, { reason: "none" });
                }
            });
        });
    }

    /** Makes a snap point the active one (the Popup's swipe). */
    setSnapPoint(next: SnapPoint | null, details: ChangeDetails): void {
        this.snapping.set(next, details);
    }
}
