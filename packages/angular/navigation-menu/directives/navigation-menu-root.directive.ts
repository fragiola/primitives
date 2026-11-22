import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    InjectionToken,
    inject,
    input,
    linkedSignal,
    numberAttribute,
    output,
    signal,
    untracked,
} from "@angular/core";
import {
    type ActivationDirection,
    activationDirection,
} from "@fragiola/primitives/collection";
import { createHoverIntent } from "@fragiola/primitives/hover";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    createPresence,
    dataValues,
    injectFlush,
    injectHost,
    placementSignal,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

export type NavigationMenuOrientation = "horizontal" | "vertical";

/** How the open Content was opened: the pointer's hover, or a press (and the keyboard). */
export type OpenedBy = "hover" | "press";

/** Provided by a Content: a Root inside it is a nested level (spec/navigation-menu.md). */
export const NAVIGATION_MENU_CONTENT = new InjectionToken<true>(
    "NAVIGATION_MENU_CONTENT",
);

export interface NavigationMenuRootState {
    open: boolean;
    orientation: NavigationMenuOrientation;
    nested: boolean;
}

/**
 * A site's navigation (spec/navigation-menu.md): `<nav navigationMenuRoot aria-label="Main"
 * [(value)]="value">`; inside a Content, a nested level (`<div navigationMenuRoot>`). The APG
 * disclosure navigation menu, with Base UI's hover, shared popup and nested levels.
 */
@Directive({
    selector: "[navigationMenuRoot]",
    exportAs: "navigationMenuRoot",
    host: {
        "data-primitives-part": "navigation-menu-root",
        "[attr.data-orientation]": "orientation()",
    },
})
export class NavigationMenuRoot {
    /** The open item's value, controlled (`null`: closed). */
    readonly value = input<string | null | undefined>(undefined);
    readonly valueChange = output<string | null>();
    readonly defaultValue = input<string | null>(null);
    readonly valueChangeDetails = output<ValueChangeEvent<string | null>>();
    /** ms before a hover opens (default `50`). */
    readonly delay = input(50, { transform: numberAttribute });
    /** ms before the pointer leaving closes (default `50`). */
    readonly closeDelay = input(50, { transform: numberAttribute });
    readonly orientation = input<NavigationMenuOrientation>("horizontal");
    /** The arrow keys wrap at the ends (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    readonly nested =
        inject(NAVIGATION_MENU_CONTENT, { optional: true }) !== null;
    readonly element = injectHost();
    readonly flush = injectFlush();
    private readonly selection = controllable<string | null, ChangeDetails>(
        this.value,
        this.valueChange,
        () => this.defaultValue(),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The open item's value. */
    readonly current = this.selection.value;
    readonly open = computed(() => this.current() !== null);
    /** The last open item's value: its Content stays while the popup exits. */
    readonly lastValue = linkedSignal<string | null, string | null>({
        source: this.current,
        computation: (value, previous) => value ?? previous?.value ?? null,
    });
    readonly triggers = new Map<string, HTMLElement>();
    readonly version = signal(0);
    readonly activeTrigger = computed(() => {
        this.version();
        const shown = this.lastValue();
        return shown === null ? null : (this.triggers.get(shown) ?? null);
    });
    readonly activationDirection = signal<ActivationDirection>("none");
    openedBy: { by: OpenedBy; at: number } = { by: "press", at: 0 };
    readonly lastReason: { current: ChangeReason | null } = { current: null };
    /** The value a hover is about to open. */
    pendingHover: string | null = null;
    /** The Content that takes focus once it renders (the open key). */
    pendingFocus: string | null = null;

    /**
     * The popup's layer is open: the open key's focus waits for it, or the parent level's focus
     * watch (which accepts its child layers only) would see the focus leave.
     */
    readonly layered = signal(false);
    readonly positioner = signal<HTMLElement | null>(null);
    readonly popup = signal<HTMLElement | null>(null);
    readonly viewport = signal<HTMLElement | null>(null);
    readonly arrow = signal<HTMLElement | null>(null);
    readonly placed = placementSignal({ side: "bottom", align: "center" });
    /** The open Content's size: the popup's size variables. */
    readonly size = signal<{ width: number; height: number } | null>(null, {
        equal: (a, b) => a?.width === b?.width && a?.height === b?.height,
    });
    readonly presence = createPresence(this.open, this.popup);
    readonly hover = createHoverIntent({
        open: () => {
            const item = this.pendingHover;
            if (item !== null) {
                this.setValue(item, "trigger-hover", undefined, "hover");
                this.flush();
            }
        },
        close: () => {
            this.setValue(null, "trigger-hover");
            this.flush();
        },
    });
    readonly state = computed<NavigationMenuRootState>(() => ({
        open: this.open(),
        orientation: this.orientation(),
        nested: this.nested,
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        inject(DestroyRef).onDestroy(() => this.hover.cancel());
    }

    setValue(
        next: string | null,
        reason: ChangeReason,
        event?: Event,
        by?: OpenedBy,
    ): void {
        const previous = untracked(this.current);
        if (previous === next) {
            return;
        }
        if (next !== null && by !== undefined) {
            this.openedBy = { by, at: performance.now() };
        }
        // the direction from the Trigger open before (none from closed)
        this.activationDirection.set(
            previous !== null && next !== null
                ? activationDirection(
                      this.triggers.get(previous),
                      this.triggers.get(next),
                      untracked(this.orientation),
                  )
                : "none",
        );
        this.lastReason.current = reason;
        this.selection.set(next, { reason, event });
    }

    registerTrigger(value: string, element: HTMLElement): () => void {
        this.triggers.set(value, element);
        this.version.update((count) => count + 1);
        return () => {
            if (this.triggers.get(value) === element) {
                this.triggers.delete(value);
                this.version.update((count) => count + 1);
            }
        };
    }
}
