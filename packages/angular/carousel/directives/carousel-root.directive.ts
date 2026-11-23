import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    numberAttribute,
    output,
    signal,
    untracked,
} from "@angular/core";
import {
    type CarouselController,
    carouselPages,
    clampCarouselPage,
    createRotationTimer,
    slidesInView,
    stepCarouselPage,
    watchCarousel,
} from "@fragiola/primitives/carousel";
import {
    type ChangeDetails,
    controllable,
    dataValues,
    injectHost,
    injectId,
    injectProvidedDirection,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

/** What the Root renders with (spec/carousel.md). */
export interface CarouselState {
    /** The current page, from 0. */
    page: number;
    /** The number of pages. */
    pageCount: number;
    orientation: "horizontal" | "vertical";
    /** The slides rotate. */
    playing: boolean;
    /** A hover pauses the rotation. */
    paused: boolean;
    /** A mouse drag runs. */
    dragging: boolean;
}

/** A number input that may be left unset. */
function optionalNumber(value: unknown): number | undefined {
    return value === undefined || value === null || value === ""
        ? undefined
        : numberAttribute(value);
}

/** A boolean input that may be left unset. */
function optionalBoolean(value: unknown): boolean | undefined {
    return value === undefined || value === null
        ? undefined
        : booleanAttribute(value);
}

const AUTOPLAY_TRIGGER = '[data-primitives-part="carousel-autoplay-trigger"]';

/**
 * A carousel (spec/carousel.md, the APG's): `<div carouselRoot aria-label="Featured"
 * [slideCount]="4">`, a named region whose slides scroll natively a page at a time, with an
 * optional rotation that focus stops and a hover pauses. Its DOM side is the toolkit's
 * `/carousel`, in the browser only, after the first render.
 */
@Directive({
    selector: "[carouselRoot]",
    exportAs: "carouselRoot",
    host: {
        role: "region",
        "aria-roledescription": "carousel",
        "data-primitives-part": "carousel-root",
        "[style.--carousel-slides-per-page]": "slidesPerPageValue()",
        "[style.--carousel-spacing]": "spacing()",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-playing]": "data().playing",
        "[attr.data-paused]": "data().paused",
    },
})
export class CarouselRoot {
    /** The number of slides. */
    readonly slideCount = input.required({ transform: numberAttribute });
    /** The current page, from 0 (controlled: `[(page)]` or a one-way `[page]`). */
    readonly page = input<number | undefined, unknown>(undefined, {
        transform: optionalNumber,
    });
    /** Its new page (`[(page)]`). */
    readonly pageChange = output<number>();
    /** The page at first (default `0`). */
    readonly defaultPage = input(0, { transform: numberAttribute });
    /** Every page change, with its reason. */
    readonly pageChangeDetails = output<ValueChangeEvent<number>>();
    /** The slides a page shows side by side (default `1`). */
    readonly slidesPerPage = input(1, { transform: numberAttribute });
    /** The slides a page moves by (default `slidesPerPage`). */
    readonly slidesPerMove = input<number | undefined, unknown>(undefined, {
        transform: optionalNumber,
    });
    /** Previous on the first page goes to the last, Next on the last to the first. */
    readonly loop = input(false, { transform: booleanAttribute });
    readonly orientation = input<"horizontal" | "vertical">("horizontal");
    /** The gap between slides, a CSS length (default `"0px"`). */
    readonly spacing = input("0px");
    /** `"tabbed"`: the Indicators are tabs and the slides tabpanels (default `"basic"`). */
    readonly variant = input<"basic" | "tabbed">("basic");
    /** Whether the slides rotate (controlled: `[(playing)]` or a one-way `[playing]`). */
    readonly playing = input<boolean | undefined, unknown>(undefined, {
        transform: optionalBoolean,
    });
    /** Its new rotation state (`[(playing)]`). */
    readonly playingChange = output<boolean>();
    /** Whether the slides rotate at first (default `false`). */
    readonly defaultPlaying = input(false, { transform: booleanAttribute });
    /** Every rotation change, with its reason. */
    readonly playingChangeDetails = output<ValueChangeEvent<boolean>>();
    /** The time a page shows while rotating, in ms (default `5000`). */
    readonly delay = input(5000, { transform: numberAttribute });
    /** A mouse drag scrolls the slides (default `true`). */
    readonly allowMouseDrag = input(true, { transform: booleanAttribute });

    readonly baseId = injectId("primitives-carousel");
    private readonly host = injectHost();
    private readonly direction = injectProvidedDirection();
    /** The ItemGroup's element, which registers itself. */
    readonly group = signal<HTMLElement | null>(null);
    private readonly hovered = signal(false);
    private readonly draggingState = signal(false);
    private readonly tabStop = signal(false);
    /** The group holds nothing Tab reaches: it takes a tab stop of its own. */
    readonly groupTabStop = this.tabStop.asReadonly();
    private readonly ready = signal(false);
    private readonly controller = signal<CarouselController | null>(null);
    /** The next scroll to a page is the first since the watch began: at once. */
    private instantScroll = true;

    /** The number of slides, a whole number from 0. */
    readonly count = computed(() => Math.max(0, Math.floor(this.slideCount())));
    protected readonly slidesPerPageValue = computed(() =>
        String(Math.max(1, this.slidesPerPage())),
    );
    /** Each page's first slide. */
    readonly pages = computed(() =>
        carouselPages({
            slideCount: this.count(),
            slidesPerPage: this.slidesPerPage(),
            slidesPerMove: this.slidesPerMove(),
        }),
    );
    private readonly ownPage = controllable<number, ChangeDetails>(
        this.page,
        this.pageChange,
        () => this.defaultPage(),
        (value, details) => this.pageChangeDetails.emit({ value, details }),
    );
    /** The current page, clamped to the pages. */
    readonly currentPage = computed(() =>
        clampCarouselPage(this.ownPage.value(), this.pages().length),
    );
    private readonly ownPlaying = controllable<boolean, ChangeDetails>(
        this.playing,
        this.playingChange,
        () => this.defaultPlaying(),
        (value, details) => this.playingChangeDetails.emit({ value, details }),
    );
    /** Whether the slides rotate. */
    readonly isPlaying = this.ownPlaying.value;
    /** The slides in view. */
    readonly inView = computed(
        () =>
            new Set(
                slidesInView(
                    this.pages(),
                    this.currentPage(),
                    this.count(),
                    this.slidesPerPage(),
                ),
            ),
    );
    readonly state = computed<CarouselState>(() => ({
        page: this.currentPage(),
        pageCount: this.pages().length,
        orientation: this.orientation(),
        playing: this.isPlaying(),
        paused: this.isPlaying() && this.hovered(),
        dragging: this.draggingState(),
    }));
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            orientation: state.orientation,
            playing: state.playing,
            paused: state.paused,
        });
    });

    constructor() {
        const timer = createRotationTimer(this.host);
        afterNextRender(() => this.ready.set(true));
        // the toolkit's watch, once rendered in the browser; a new orientation watches the other axis
        effect((onCleanup) => {
            const group = this.group();
            this.orientation();
            if (!this.ready() || group === null) {
                return;
            }
            const created = untracked(() =>
                watchCarousel(this.host, group, {
                    orientation: () => untracked(this.orientation),
                    direction: () => untracked(this.direction),
                    allowMouseDrag: () => untracked(this.allowMouseDrag),
                    pages: () => untracked(this.pages),
                    page: () => untracked(this.currentPage),
                    slide: (index) =>
                        this.host.ownerDocument.getElementById(
                            this.slideId(index),
                        ),
                    hoverExempt: (target) =>
                        target.closest(AUTOPLAY_TRIGGER) !== null,
                    onHoverChange: (hovered) => this.hovered.set(hovered),
                    onFocusIn: (event) => {
                        if (untracked(this.isPlaying)) {
                            this.setPlaying(false, {
                                reason: "focus-in",
                                event,
                            });
                        }
                    },
                    onDraggingChange: (dragging) =>
                        this.draggingState.set(dragging),
                    onPageSettle: (page, reason, event) =>
                        this.setPage(page, { reason, event }),
                }),
            );
            this.instantScroll = true;
            this.controller.set(created);
            onCleanup(() => {
                created.destroy();
                this.controller.set(null);
            });
        });
        // the page's first slide at the group's start: at once on mount, smoothly after; the
        // group's tab stop once the page's slides rendered
        afterRenderEffect(() => {
            const controller = this.controller();
            const page = this.currentPage();
            this.pages();
            if (controller === null) {
                return;
            }
            untracked(() => {
                controller.scrollToPage(page, this.instantScroll);
                this.instantScroll = false;
                this.tabStop.set(controller.needsTabStop());
            });
        });
        // the rotation: each page while playing starts the whole delay again
        effect(() => {
            const playing = this.isPlaying();
            this.currentPage();
            const delay = this.delay();
            if (!this.ready()) {
                return;
            }
            untracked(() => {
                if (!playing) {
                    timer.stop();
                    return;
                }
                timer.start(delay, () => {
                    const all = this.pages();
                    this.setPage(
                        stepCarouselPage(
                            this.currentPage(),
                            all.length,
                            1,
                            true,
                        ) ?? 0,
                        { reason: "autoplay" },
                    );
                });
            });
        });
        effect(() => {
            const paused = this.state().paused;
            untracked(() => {
                if (paused) {
                    timer.pause();
                } else {
                    timer.resume();
                }
            });
        });
        inject(DestroyRef).onDestroy(() => timer.stop());
    }

    /** A slide's id. */
    slideId(index: number): string {
        return `${this.baseId}-slide-${index}`;
    }

    /** An Indicator's id. */
    indicatorId(index: number): string {
        return `${this.baseId}-indicator-${index}`;
    }

    /** The ItemGroup's id, which the Previous and Next triggers control. */
    groupId(): string {
        return `${this.baseId}-items`;
    }

    /** Moves to `page` (clamped), unless it is the current one. */
    setPage(page: number, details: ChangeDetails): void {
        const target = clampCarouselPage(page, untracked(this.pages).length);
        if (target !== untracked(this.currentPage)) {
            this.ownPage.set(target, details);
        }
    }

    /** Starts or stops the rotation, unless it already is so. */
    setPlaying(playing: boolean, details: ChangeDetails): void {
        if (playing !== untracked(this.isPlaying)) {
            this.ownPlaying.set(playing, details);
        }
    }
}
