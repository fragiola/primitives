import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    signal,
    untracked,
} from "@angular/core";
import {
    createScrollArea,
    initialScrollAreaState,
    type ScrollAreaState as Measured,
    normalizeScrollAreaThreshold,
    type ScrollAreaController,
    type ScrollAreaPart,
    type ScrollAreaThresholdInput,
} from "@fragiola/primitives/scroll-area";
import {
    dataValues,
    injectHost,
    injectProvidedDirection,
} from "@fragiola/primitives-angular/internal";

/** What the Root, the Viewport and the Content render with (spec/scroll-area.md). */
export interface ScrollAreaState {
    /** The user scrolls the area (either axis). */
    scrolling: boolean;
    hasOverflowX: boolean;
    hasOverflowY: boolean;
    overflowXStart: boolean;
    overflowXEnd: boolean;
    overflowYStart: boolean;
    overflowYEnd: boolean;
}

/** The `data-*` values of a state: `scrolling` and the overflow attributes. */
export function scrollAreaData(state: ScrollAreaState) {
    return dataValues({
        scrolling: state.scrolling,
        "has-overflow-x": state.hasOverflowX,
        "has-overflow-y": state.hasOverflowY,
        "overflow-x-start": state.overflowXStart,
        "overflow-x-end": state.overflowXEnd,
        "overflow-y-start": state.overflowYStart,
        "overflow-y-end": state.overflowYEnd,
    });
}

/**
 * The box of a scrolling area (spec/scroll-area.md): `<div scrollAreaRoot>` around its Viewport,
 * Scrollbars and Corner. It holds the measured state, which the toolkit's `createScrollArea`
 * reports for the parts that register with it; the controller runs in the browser only.
 */
@Directive({
    selector: "[scrollAreaRoot]",
    exportAs: "scrollAreaRoot",
    host: {
        role: "presentation",
        "data-primitives-part": "scroll-area-root",
        "[style.position]": "'relative'",
        "[attr.data-scrolling]": "data().scrolling",
        "[attr.data-has-overflow-x]": "data()['has-overflow-x']",
        "[attr.data-has-overflow-y]": "data()['has-overflow-y']",
        "[attr.data-overflow-x-start]": "data()['overflow-x-start']",
        "[attr.data-overflow-x-end]": "data()['overflow-x-end']",
        "[attr.data-overflow-y-start]": "data()['overflow-y-start']",
        "[attr.data-overflow-y-end]": "data()['overflow-y-end']",
    },
})
export class ScrollAreaRoot {
    /**
     * How far, in pixels, the content must be scrolled from an edge before its `data-overflow-*`
     * attribute is set: one number, or `{ xStart, xEnd, yStart, yEnd }` (default `0`).
     */
    readonly overflowEdgeThreshold = input<
        ScrollAreaThresholdInput | undefined
    >(undefined);

    private readonly measuredState = signal<Measured>(initialScrollAreaState());
    /** The toolkit's measured state. */
    readonly measured = this.measuredState.asReadonly();
    readonly state = computed<ScrollAreaState>(() => {
        const measured = this.measured();
        return {
            scrolling: measured.scrollingX || measured.scrollingY,
            hasOverflowX: measured.hasOverflowX,
            hasOverflowY: measured.hasOverflowY,
            overflowXStart: measured.overflowXStart,
            overflowXEnd: measured.overflowXEnd,
            overflowYStart: measured.overflowYStart,
            overflowYEnd: measured.overflowYEnd,
        };
    });
    protected readonly data = computed(() => scrollAreaData(this.state()));

    private readonly direction = injectProvidedDirection();
    private readonly threshold = computed(() =>
        normalizeScrollAreaThreshold(this.overflowEdgeThreshold()),
    );
    private controller: ScrollAreaController | null = null;
    // the parts register before the controller exists (it is created after the first render)
    private readonly parts = new Map<ScrollAreaPart, HTMLElement | null>();

    constructor() {
        const host = injectHost();
        afterNextRender(() => {
            const created = createScrollArea(host, {
                direction: () => untracked(this.direction),
                threshold: () => untracked(this.threshold),
                onStateChange: (state) => this.measuredState.set(state),
            });
            this.controller = created;
            for (const [part, element] of this.parts) {
                created.setPart(part, element);
            }
        });
        // a new direction or threshold measures again
        effect(() => {
            this.direction();
            this.threshold();
            untracked(() => this.controller?.update());
        });
        inject(DestroyRef).onDestroy(() => {
            this.controller?.destroy();
            this.controller = null;
        });
    }

    /** Registers a part's element with the controller (`null` when it goes). */
    setPart(part: ScrollAreaPart, element: HTMLElement | null): void {
        this.parts.set(part, element);
        this.controller?.setPart(part, element);
    }

    /** Registers the injection context's host as `part` for as long as its directive lives. */
    registerHost(part: ScrollAreaPart, host: HTMLElement): void {
        this.setPart(part, host);
        inject(DestroyRef).onDestroy(() => {
            if (this.parts.get(part) === host) {
                this.setPart(part, null);
            }
        });
    }
}
