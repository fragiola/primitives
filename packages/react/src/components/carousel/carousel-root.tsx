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
    type CSSProperties,
    useContext,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CarouselContext,
    type CarouselState,
    carouselSlideId,
} from "./carousel-context.ts";

export interface CarouselRootProps extends PartProps<CarouselState> {
    /** The number of slides. */
    slideCount: number;
    /** The current page, from 0 (controlled). */
    page?: number;
    /** The page at first (default `0`). */
    defaultPage?: number;
    /** Every page change, with its reason. */
    onPageChange?: (page: number, details: ChangeDetails) => void;
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
    /** Whether the slides rotate (controlled). */
    playing?: boolean;
    /** Whether the slides rotate at first (default `false`). */
    defaultPlaying?: boolean;
    /** Every rotation change, with its reason. */
    onPlayingChange?: (playing: boolean, details: ChangeDetails) => void;
    /** The time a page shows while rotating, in ms (default `5000`). */
    delay?: number;
    /** A mouse drag scrolls the slides (default `true`). */
    allowMouseDrag?: boolean;
}

const AUTOPLAY_TRIGGER = '[data-primitives-part="carousel-autoplay-trigger"]';

/**
 * A carousel (spec/carousel.md, the APG's): a named region whose slides scroll natively a page at
 * a time, with an optional rotation that focus stops and a hover pauses. Its DOM side is the
 * toolkit's `/carousel`.
 */
export function CarouselRoot({
    slideCount: slideCountProp,
    page: pageProp,
    defaultPage = 0,
    onPageChange,
    slidesPerPage = 1,
    slidesPerMove,
    loop = false,
    orientation = "horizontal",
    spacing = "0px",
    variant = "basic",
    playing: playingProp,
    defaultPlaying = false,
    onPlayingChange,
    delay = 5000,
    allowMouseDrag = true,
    style,
    ...props
}: CarouselRootProps) {
    const slideCount = Math.max(0, Math.floor(slideCountProp));
    const pages = useMemo(
        () => carouselPages({ slideCount, slidesPerPage, slidesPerMove }),
        [slideCount, slidesPerPage, slidesPerMove],
    );
    const [own, setOwnPage] = useControllableState(
        pageProp,
        defaultPage,
        onPageChange,
    );
    const page = clampCarouselPage(own, pages.length);
    const [playing, setOwnPlaying] = useControllableState(
        playingProp,
        defaultPlaying,
        onPlayingChange,
    );
    const [hovered, setHovered] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [groupTabStop, setGroupTabStop] = useState(false);
    const paused = playing && hovered;
    const direction = useContext(DirectionContext);
    const baseId = useId();
    const [root, rootRef] = useElement<HTMLElement>();
    const [group, setGroup] = useElement<HTMLElement>();
    const inView = useMemo(
        () => new Set(slidesInView(pages, page, slideCount, slidesPerPage)),
        [pages, page, slideCount, slidesPerPage],
    );

    const setPage = (next: number, details: ChangeDetails) => {
        const target = clampCarouselPage(next, pages.length);
        if (target !== page) {
            setOwnPage(target, details);
        }
    };
    const setPlaying = (next: boolean, details: ChangeDetails) => {
        if (next !== playing) {
            setOwnPlaying(next, details);
        }
    };
    const latest = useRef({
        page,
        pages,
        playing,
        direction,
        orientation,
        allowMouseDrag,
        setPage,
        setPlaying,
    });
    latest.current = {
        page,
        pages,
        playing,
        direction,
        orientation,
        allowMouseDrag,
        setPage,
        setPlaying,
    };

    const controller = useRef<CarouselController | null>(null);
    const timer = useRef<RotationTimer | null>(null);
    const scrolled = useRef(false);
    // biome-ignore lint/correctness/useExhaustiveDependencies: a new orientation watches the other axis
    useLayoutEffect(() => {
        if (root === null || group === null) {
            return undefined;
        }
        const created = watchCarousel(root, group, {
            orientation: () => latest.current.orientation,
            direction: () => latest.current.direction,
            allowMouseDrag: () => latest.current.allowMouseDrag,
            pages: () => latest.current.pages,
            page: () => latest.current.page,
            slide: (index) =>
                root.ownerDocument.getElementById(
                    carouselSlideId(baseId, index),
                ),
            hoverExempt: (target) => target.closest(AUTOPLAY_TRIGGER) !== null,
            onHoverChange: setHovered,
            onFocusIn: (event) => {
                if (latest.current.playing) {
                    latest.current.setPlaying(false, {
                        reason: "focus-in",
                        event,
                    });
                }
            },
            onDraggingChange: setDragging,
            onPageSettle: (next, reason, event) =>
                latest.current.setPage(next, { reason, event }),
        });
        controller.current = created;
        timer.current = createRotationTimer(root);
        scrolled.current = false;
        return () => {
            created.destroy();
            timer.current?.stop();
            controller.current = null;
            timer.current = null;
        };
    }, [root, group, baseId, orientation]);

    // the page's first slide at the group's start: at once on mount, smoothly after
    // biome-ignore lint/correctness/useExhaustiveDependencies: `root`, `group` and `orientation` re-run it on a new watch (a new timer)
    useLayoutEffect(() => {
        if (controller.current === null) {
            return;
        }
        controller.current.scrollToPage(page, !scrolled.current);
        scrolled.current = true;
        setGroupTabStop(controller.current.needsTabStop());
    }, [page, pages, root, group, orientation]);

    // the rotation: each page while playing starts the whole delay again
    // biome-ignore lint/correctness/useExhaustiveDependencies: `root`, `group` and `orientation` re-run it on a new watch (a new timer)
    useLayoutEffect(() => {
        const current = timer.current;
        if (current === null) {
            return;
        }
        if (!playing) {
            current.stop();
            return;
        }
        current.start(delay, () => {
            const { page: from, pages: all } = latest.current;
            latest.current.setPage(
                stepCarouselPage(from, all.length, 1, true) ?? 0,
                {
                    reason: "autoplay",
                },
            );
        });
    }, [playing, page, delay, root, group, orientation]);
    // biome-ignore lint/correctness/useExhaustiveDependencies: `root`, `group` and `orientation` re-run it on a new watch (a new timer)
    useLayoutEffect(() => {
        if (paused) {
            timer.current?.pause();
        } else {
            timer.current?.resume();
        }
    }, [paused, root, group, orientation]);

    const context = {
        page,
        pageCount: pages.length,
        orientation,
        playing,
        paused,
        dragging,
        pages,
        inView,
        slideCount,
        loop,
        variant,
        baseId,
        setPage,
        setPlaying,
        setGroup,
        groupTabStop,
    };
    const state: CarouselState = {
        page,
        pageCount: pages.length,
        orientation,
        playing,
        paused,
        dragging,
    };
    const structural = {
        "--carousel-slides-per-page": String(Math.max(1, slidesPerPage)),
        "--carousel-spacing": spacing,
    } as CSSProperties;
    return (
        <CarouselContext.Provider value={context}>
            {renderElement(
                "div",
                {
                    ...props,
                    style: (current: CarouselState) => ({
                        ...structural,
                        ...(typeof style === "function"
                            ? style(current)
                            : style),
                    }),
                },
                state,
                {
                    role: "region",
                    "aria-roledescription": "carousel",
                    "data-primitives-part": "carousel-root",
                    ...stateAttributes({ orientation, playing, paused }),
                },
                rootRef,
            )}
        </CarouselContext.Provider>
    );
}
