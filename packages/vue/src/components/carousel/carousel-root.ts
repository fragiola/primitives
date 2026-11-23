import {
    type CarouselController,
    carouselPages,
    clampCarouselPage,
    createRotationTimer,
    type RotationTimer,
    slidesInView,
    stepCarouselPage,
    watchCarousel,
} from "@fragiola/primitives/carousel";
import {
    computed,
    defineComponent,
    type PropType,
    provide,
    shallowRef,
    useId,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CarouselKey,
    type CarouselState,
    carouselSlideId,
} from "./carousel-context.ts";

export interface CarouselRootProps {
    /** The number of slides. */
    slideCount: number;
    /** The current page, from 0 (`v-model:page`). */
    page?: number;
    /** The page at first (default `0`). */
    defaultPage?: number;
    /** The slides a page shows side by side (default `1`). */
    slidesPerPage?: number;
    /** The slides a page moves by (default `slidesPerPage`). */
    slidesPerMove?: number;
    /** Previous on the first page goes to the last, Next on the last to the first. */
    loop?: boolean;
    orientation?: "horizontal" | "vertical";
    /** The gap between slides, a CSS length (default `"0px"`). */
    spacing?: string;
    /** `"tabbed"`: the Indicators are tabs and the slides tabpanels (default `"basic"`). */
    variant?: "basic" | "tabbed";
    /** Whether the slides rotate (`v-model:playing`). */
    playing?: boolean;
    /** Whether the slides rotate at first (default `false`). */
    defaultPlaying?: boolean;
    /** The time a page shows while rotating, in ms (default `5000`). */
    delay?: number;
    /** A mouse drag scrolls the slides (default `true`). */
    allowMouseDrag?: boolean;
}

export type CarouselRootEmits = {
    /** The new page (`v-model:page`). */
    "update:page": (page: number) => true;
    /** Every page change, with its reason. */
    pageChange: (page: number, details: ChangeDetails) => true;
    /** The new rotation state (`v-model:playing`). */
    "update:playing": (playing: boolean) => true;
    /** Every rotation change, with its reason. */
    playingChange: (playing: boolean, details: ChangeDetails) => true;
};

const AUTOPLAY_TRIGGER = '[data-primitives-part="carousel-autoplay-trigger"]';

/**
 * A carousel (spec/carousel.md, the APG's): a named region whose slides scroll natively a page at
 * a time, with an optional rotation that focus stops and a hover pauses. Its DOM side is the
 * toolkit's `/carousel`.
 */
export const CarouselRoot: PartComponent<
    CarouselRootProps,
    CarouselState,
    CarouselRootEmits
> = publicComponent(
    defineComponent({
        name: "CarouselRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            slideCount: { type: Number, required: true },
            page: { type: Number, default: undefined },
            defaultPage: { type: Number, default: 0 },
            slidesPerPage: { type: Number, default: 1 },
            slidesPerMove: { type: Number, default: undefined },
            loop: { type: Boolean, default: false },
            orientation: {
                type: String as PropType<"horizontal" | "vertical">,
                default: "horizontal",
            },
            spacing: { type: String, default: "0px" },
            variant: {
                type: String as PropType<"basic" | "tabbed">,
                default: "basic",
            },
            playing: { type: Boolean, default: undefined },
            defaultPlaying: { type: Boolean, default: false },
            delay: { type: Number, default: 5000 },
            allowMouseDrag: { type: Boolean, default: true },
        },
        emits: {
            "update:page": (_page: number) => true,
            pageChange: (_page: number, _details: ChangeDetails) => true,
            "update:playing": (_playing: boolean) => true,
            playingChange: (_playing: boolean, _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const slideCount = computed(() =>
                Math.max(0, Math.floor(props.slideCount)),
            );
            const pages = computed(() =>
                carouselPages({
                    slideCount: slideCount.value,
                    slidesPerPage: props.slidesPerPage,
                    slidesPerMove: props.slidesPerMove,
                }),
            );
            const ownPage = useControllable<number, ChangeDetails>(
                () => props.page,
                props.defaultPage,
                (next, details) => {
                    emit("update:page", next);
                    emit("pageChange", next, details);
                },
            );
            const page = computed(() =>
                clampCarouselPage(ownPage.value.value, pages.value.length),
            );
            const ownPlaying = useControllable<boolean, ChangeDetails>(
                () => props.playing,
                props.defaultPlaying,
                (next, details) => {
                    emit("update:playing", next);
                    emit("playingChange", next, details);
                },
            );
            const playing = computed(() => ownPlaying.value.value);
            const hovered = shallowRef(false);
            const dragging = shallowRef(false);
            const groupTabStop = shallowRef(false);
            const paused = computed(() => playing.value && hovered.value);
            const inView = computed(
                () =>
                    new Set(
                        slidesInView(
                            pages.value,
                            page.value,
                            slideCount.value,
                            props.slidesPerPage,
                        ),
                    ),
            );
            const direction = useProvidedDirection();
            const baseId = useId();
            const root = shallowRef<HTMLElement | null>(null);
            const group = shallowRef<HTMLElement | null>(null);
            const setRoot = elementSetter(root);
            const setGroup = elementSetter(group);

            const setPage = (next: number, details: ChangeDetails) => {
                const target = clampCarouselPage(next, pages.value.length);
                if (target !== page.value) {
                    ownPage.set(target, details);
                }
            };
            const setPlaying = (next: boolean, details: ChangeDetails) => {
                if (next !== playing.value) {
                    ownPlaying.set(next, details);
                }
            };

            const controller = shallowRef<CarouselController | null>(null);
            const timer = shallowRef<RotationTimer | null>(null);
            let scrolled = false;
            watch(
                [root, group, () => props.orientation],
                ([rootElement, groupElement], _, onCleanup) => {
                    if (rootElement === null || groupElement === null) {
                        return;
                    }
                    const created = watchCarousel(rootElement, groupElement, {
                        orientation: () => props.orientation,
                        direction,
                        allowMouseDrag: () => props.allowMouseDrag,
                        pages: () => pages.value,
                        page: () => page.value,
                        slide: (index) =>
                            rootElement.ownerDocument.getElementById(
                                carouselSlideId(baseId, index),
                            ),
                        hoverExempt: (target) =>
                            target.closest(AUTOPLAY_TRIGGER) !== null,
                        onHoverChange: (next) => {
                            hovered.value = next;
                        },
                        onFocusIn: (event) => {
                            if (playing.value) {
                                setPlaying(false, {
                                    reason: "focus-in",
                                    event,
                                });
                            }
                        },
                        onDraggingChange: (next) => {
                            dragging.value = next;
                        },
                        onPageSettle: (next, reason, event) =>
                            setPage(next, { reason, event }),
                    });
                    const rotation = createRotationTimer(rootElement);
                    scrolled = false;
                    controller.value = created;
                    timer.value = rotation;
                    onCleanup(() => {
                        created.destroy();
                        rotation.stop();
                        controller.value = null;
                        timer.value = null;
                    });
                },
                { flush: "post" },
            );
            // the page's first slide at the group's start: at once on mount, smoothly after
            watch(
                [page, pages, controller],
                () => {
                    const current = controller.value;
                    if (current === null) {
                        return;
                    }
                    current.scrollToPage(page.value, !scrolled);
                    scrolled = true;
                    groupTabStop.value = current.needsTabStop();
                },
                { flush: "post" },
            );
            // the rotation: each page while playing starts the whole delay again
            watch(
                [playing, page, () => props.delay, timer],
                () => {
                    const current = timer.value;
                    if (current === null) {
                        return;
                    }
                    if (!playing.value) {
                        current.stop();
                        return;
                    }
                    current.start(props.delay, () => {
                        setPage(
                            stepCarouselPage(
                                page.value,
                                pages.value.length,
                                1,
                                true,
                            ) ?? 0,
                            { reason: "autoplay" },
                        );
                    });
                },
                { flush: "post" },
            );
            watch(
                [paused, timer],
                () => {
                    if (paused.value) {
                        timer.value?.pause();
                    } else {
                        timer.value?.resume();
                    }
                },
                { flush: "post" },
            );

            const state = (): CarouselState => ({
                page: page.value,
                pageCount: pages.value.length,
                orientation: props.orientation,
                playing: playing.value,
                paused: paused.value,
                dragging: dragging.value,
            });
            provide(CarouselKey, {
                state,
                pages: () => pages.value,
                inView: () => inView.value,
                loop: () => props.loop,
                variant: () => props.variant,
                groupTabStop: () => groupTabStop.value,
                baseId,
                setPage,
                setPlaying,
                setGroup,
            });
            return () => {
                const current = state();
                return renderPart("div", { attrs, slots }, props.as, current, {
                    role: "region",
                    "aria-roledescription": "carousel",
                    style: {
                        "--carousel-slides-per-page": String(
                            Math.max(1, props.slidesPerPage),
                        ),
                        "--carousel-spacing": props.spacing,
                    },
                    "data-primitives-part": "carousel-root",
                    ...stateAttributes({
                        orientation: current.orientation,
                        playing: current.playing,
                        paused: current.paused,
                    }),
                    ref: setRoot,
                });
            };
        },
    }),
);
