import { type Direction, getDirection } from "../direction/direction.ts";
import { getTabbables } from "../focus/tabbable.ts";
import { startDrag } from "../pointer/drag-session.ts";
import { SWIPE_FLICK_VELOCITY } from "../swipe/swipe-release.ts";
import { SWIPE_LOCK_DISTANCE } from "../swipe/watch-swipe.ts";
import {
    type CarouselOrientation,
    groupScrollPosition,
    nearestCarouselPage,
    slideScrollPosition,
} from "./carousel-scroll.ts";

/** How long after the last `scroll` a scroll counts as settled without `scrollend`, in ms. */
const SETTLE_DELAY = 100;

/** A press on one of these is no drag (`/swipe`'s rule for a mouse). */
const INTERACTIVE =
    'a[href],button,input,select,textarea,label,summary,[role="button"],[contenteditable]:not([contenteditable="false"])';

/** The input that starts a scroll of the user's own, which replaces a scroll of ours. */
const USER_INPUT = ["pointerdown", "wheel", "touchstart", "keydown"] as const;

export interface CarouselWatchOptions {
    orientation: () => CarouselOrientation;
    /** The direction a DirectionProvider gives, `null` without one. */
    direction: () => Direction | null;
    /** Whether a mouse drag scrolls the slides. */
    allowMouseDrag: () => boolean;
    /** Each page's first slide, in order (`carouselPages`). */
    pages: () => readonly number[];
    /** The current page, which a drag moves from. */
    page: () => number;
    /** A slide's element, by its index. */
    slide: (index: number) => HTMLElement | null;
    /**
     * The AutoplayTrigger: the pointer over it does not pause the rotation, and a pointer press
     * focusing it does not stop it (the press toggles it).
     */
    hoverExempt?: (target: Element) => boolean;
    /** The pointer started or stopped hovering the carousel (but an exempt element). */
    onHoverChange: (hovered: boolean) => void;
    /** Focus entered the carousel from outside it. */
    onFocusIn: (event: FocusEvent) => void;
    /** A mouse drag started or ended. */
    onDraggingChange: (dragging: boolean) => void;
    /**
     * A scroll the user made settled on `page`: `swipe` for any native scroll (touch, a trackpad,
     * the wheel), `drag` for a mouse drag. The group already scrolls to it.
     */
    onPageSettle: (
        page: number,
        reason: "swipe" | "drag",
        event: Event | undefined,
    ) => void;
}

export interface CarouselController {
    /**
     * Whether the group needs a tab stop of its own: it holds no element Tab reaches (the
     * out-of-view slides are `inert`), so a keyboard can still scroll it (ScrollArea's rule).
     */
    needsTabStop: () => boolean;
    /** Scrolls the group to a page's first slide: smoothly, or at once (`instant`). */
    scrollToPage: (page: number, instant?: boolean) => void;
    destroy: () => void;
}

/**
 * The DOM side of a carousel (spec/carousel.md): native listeners on its `root` and its slides'
 * scroll container `group`, so a framework's own event system (Vue's invoker under a fixed test
 * clock) never drops one. It scrolls the group to a page, reports the page a user's scroll settled
 * on, runs the mouse drag (`/pointer`'s drag session, snapping off while it runs), and reports
 * the hover and the focus entering. It holds no page and no playing state: the framework does.
 */
export function watchCarousel(
    root: HTMLElement,
    group: HTMLElement,
    options: CarouselWatchOptions,
): CarouselController {
    const view = root.ownerDocument.defaultView;
    let settleTimer: number | undefined;
    /**
     * Where a scroll of our own goes: its settling reports nothing, nor does a scroll that stops
     * on the way (a later scroll of our own replaced it); the user's input clears it.
     */
    let programmatic: number | null = null;
    /** The snap type a drag turned off, put back once the scroll after it settled. */
    let heldSnap: string | null = null;
    let dragging = false;
    let dragFrom = 0;
    let hovered = false;

    const position = () => groupScrollPosition(group, options.orientation());
    const pagePosition = (page: number) => {
        const start = options.pages()[page];
        const element = start === undefined ? null : options.slide(start);
        return element === null
            ? null
            : slideScrollPosition(
                  group,
                  element,
                  options.orientation(),
                  options.direction(),
              );
    };
    const reducedMotion = () =>
        view?.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

    const scrollTo = (target: number, instant: boolean) => {
        programmatic = target;
        const vertical = options.orientation() === "vertical";
        group.scrollTo({
            [vertical ? "top" : "left"]: target,
            behavior: instant || reducedMotion() ? "instant" : "smooth",
        });
    };

    const scrollToPage = (page: number, instant = false) => {
        const target = pagePosition(page);
        if (target === null || Math.abs(target - position()) < 1) {
            return;
        }
        scrollTo(target, instant);
    };

    const restoreSnap = () => {
        if (heldSnap !== null) {
            group.style.scrollSnapType = heldSnap;
            heldSnap = null;
        }
    };

    const settle = (event: Event | undefined) => {
        if (settleTimer !== undefined) {
            view?.clearTimeout(settleTimer);
            settleTimer = undefined;
        }
        if (dragging) {
            return;
        }
        if (programmatic !== null) {
            if (Math.abs(programmatic - position()) < 1) {
                programmatic = null;
                restoreSnap();
            }
            return;
        }
        restoreSnap();
        options.onPageSettle(
            nearestCarouselPage(
                group,
                options.pages(),
                options.slide,
                options.orientation(),
                options.direction(),
            ),
            "swipe",
            event,
        );
    };

    const onScroll = () => {
        if (settleTimer !== undefined) {
            view?.clearTimeout(settleTimer);
        }
        settleTimer = view?.setTimeout(() => settle(undefined), SETTLE_DELAY);
    };
    const onScrollEnd = (event: Event) => settle(event);
    const onUserInput = () => {
        programmatic = null;
    };

    const onPointerOver = (event: PointerEvent) => {
        const target = event.target;
        const next = !(
            target instanceof Element && options.hoverExempt?.(target)
        );
        if (next !== hovered) {
            hovered = next;
            options.onHoverChange(next);
        }
    };
    const onPointerLeave = () => {
        if (hovered) {
            hovered = false;
            options.onHoverChange(false);
        }
    };
    // a pointer press on the AutoplayTrigger focuses it without stopping the rotation: the
    // press itself toggles it
    let pressing = false;
    const onPressEnd = () => {
        pressing = false;
        view?.removeEventListener("pointerup", onPressEnd, true);
        view?.removeEventListener("pointercancel", onPressEnd, true);
    };
    const onPressStart = () => {
        pressing = true;
        view?.addEventListener("pointerup", onPressEnd, true);
        view?.addEventListener("pointercancel", onPressEnd, true);
    };
    const onFocusIn = (event: FocusEvent) => {
        const from = event.relatedTarget;
        if (from instanceof Node && root.contains(from)) {
            return;
        }
        const target = event.target;
        if (
            pressing &&
            target instanceof Element &&
            options.hoverExempt?.(target)
        ) {
            return;
        }
        options.onFocusIn(event);
    };

    // the click that ends a drag is not delivered (a slide's link would follow it)
    const swallowClick = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
    };

    /** The page a drag released on: the nearest, or after a flick the next one its way. */
    const releasedPage = (velocity: number) => {
        const pages = options.pages();
        const vertical = options.orientation() === "vertical";
        const page = nearestCarouselPage(
            group,
            pages,
            options.slide,
            options.orientation(),
            options.direction(),
        );
        const from = options.page();
        if (Math.abs(velocity) <= SWIPE_FLICK_VELOCITY || page !== from) {
            return page;
        }
        // a flick moves one page the way the content travelled: towards the scroll's end is the
        // next page (in RTL the horizontal scroll runs to negative values)
        const step = Math.sign(position() - dragFrom);
        const rtl =
            !vertical && getDirection(group, options.direction()) === "rtl";
        const forward = rtl ? -step : step;
        return Math.min(pages.length - 1, Math.max(0, from + forward));
    };

    // the mouse drag: `/pointer`'s drag session (with capture), started once the pointer moved
    // the swipe's lock distance along the axis. `/swipe`'s `watchSwipe` hands a move over a
    // scroller to that scroller (its scroll containment), and the group is that scroller
    let stopDrag: (() => void) | null = null;
    const onPointerDown = (event: PointerEvent) => {
        const target = event.target;
        if (
            stopDrag !== null ||
            event.pointerType !== "mouse" ||
            event.button !== 0 ||
            !event.isPrimary ||
            !options.allowMouseDrag() ||
            !(target instanceof Element) ||
            target.closest(INTERACTIVE) !== null
        ) {
            return;
        }
        // no text selection and no focus from the press: the slides are dragged
        event.preventDefault();
        const vertical = options.orientation() === "vertical";
        const origin = vertical ? event.clientY : event.clientX;
        let started = false;
        let last = { time: event.timeStamp, at: origin };
        let velocity = 0;
        dragFrom = position();
        stopDrag = startDrag(group, event, {
            onMove: (move) => {
                const at = vertical ? move.clientY : move.clientX;
                const delta = at - origin;
                if (!started) {
                    if (Math.abs(delta) < SWIPE_LOCK_DISTANCE) {
                        return;
                    }
                    started = true;
                    dragging = true;
                    if (heldSnap === null) {
                        heldSnap = group.style.scrollSnapType;
                    }
                    group.style.scrollSnapType = "none";
                    options.onDraggingChange(true);
                }
                const elapsed = move.timeStamp - last.time;
                if (elapsed > 0) {
                    velocity = (at - last.at) / elapsed;
                }
                last = { time: move.timeStamp, at };
                if (vertical) {
                    group.scrollTop = dragFrom - delta;
                } else {
                    group.scrollLeft = dragFrom - delta;
                }
            },
            onEnd: (up) => {
                stopDrag = null;
                if (!started) {
                    return;
                }
                dragging = false;
                options.onDraggingChange(false);
                group.addEventListener("click", swallowClick, true);
                view?.setTimeout(
                    () =>
                        group.removeEventListener("click", swallowClick, true),
                    0,
                );
                // a release at rest is no flick
                const rest = up === null || up.timeStamp - last.time > 80;
                const page = releasedPage(rest ? 0 : velocity);
                if (settleTimer !== undefined) {
                    view?.clearTimeout(settleTimer);
                    settleTimer = undefined;
                }
                const target = pagePosition(page);
                if (target === null || Math.abs(target - position()) < 1) {
                    restoreSnap();
                } else {
                    scrollTo(target, false);
                }
                options.onPageSettle(page, "drag", up ?? undefined);
            },
        });
    };

    group.addEventListener("scroll", onScroll);
    group.addEventListener("scrollend", onScrollEnd);
    for (const type of USER_INPUT) {
        group.addEventListener(type, onUserInput, { passive: true });
    }
    group.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointerdown", onPressStart);
    root.addEventListener("pointerover", onPointerOver);
    root.addEventListener("pointerleave", onPointerLeave);
    root.addEventListener("focusin", onFocusIn);

    return {
        needsTabStop: () => getTabbables(group).length === 0,
        scrollToPage,
        destroy: () => {
            stopDrag?.();
            group.removeEventListener("pointerdown", onPointerDown);
            root.removeEventListener("pointerdown", onPressStart);
            view?.removeEventListener("pointerup", onPressEnd, true);
            view?.removeEventListener("pointercancel", onPressEnd, true);
            if (settleTimer !== undefined) {
                view?.clearTimeout(settleTimer);
            }
            group.removeEventListener("scroll", onScroll);
            group.removeEventListener("scrollend", onScrollEnd);
            for (const type of USER_INPUT) {
                group.removeEventListener(type, onUserInput);
            }
            group.removeEventListener("click", swallowClick, true);
            root.removeEventListener("pointerover", onPointerOver);
            root.removeEventListener("pointerleave", onPointerLeave);
            root.removeEventListener("focusin", onFocusIn);
        },
    };
}
