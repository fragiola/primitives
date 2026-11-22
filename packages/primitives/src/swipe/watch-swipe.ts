/** A direction a swipe moves in: the edge it dismisses towards (spec/drawer.md, "Swipe"). */
export type SwipeDirection = "up" | "down" | "left" | "right";

/** Where a swipe is, from where it went down, in px. */
export interface SwipeMovement {
    deltaX: number;
    deltaY: number;
}

/** How a swipe ended: its movement and its velocity over the last moves, in px per ms. */
export interface SwipeEnd extends SwipeMovement {
    velocityX: number;
    velocityY: number;
}

export interface SwipeOptions {
    /**
     * The directions a swipe may move in: their axis is the one a swipe locks on (a drawer's
     * dismissal direction; both directions of that axis move it).
     */
    directions: readonly SwipeDirection[];
    /**
     * Whether a press on `target` may start a swipe, after the built-in rules (no swipe from a
     * text control, a range input, an editable element or an element marked
     * `data-swipe-ignore`; a mouse swipes from the primary button and never from an interactive
     * element). A drawer's Content lets the mouse select its text.
     */
    canStart?: (target: Element, event: PointerEvent) => boolean;
    /** The pointer moved past the lock distance along the swipe's axis. */
    onStart: (event: PointerEvent) => void;
    /** Every move of a started swipe. */
    onMove: (movement: SwipeMovement, event: PointerEvent) => void;
    /** The swipe ended: released (`end`), or canceled (`null`: a lost pointer, the cleanup). */
    onEnd: (end: SwipeEnd | null, event: PointerEvent | null) => void;
}

/** The distance a pointer moves before a swipe locks on an axis (or lets it go), in px. */
export const SWIPE_LOCK_DISTANCE = 6;

/** How far back the release velocity looks, in ms. */
const VELOCITY_WINDOW = 100;

/** A release this long after the last move is a release at rest (velocity 0), in ms. */
const RELEASE_REST = 80;

const TEXT_CONTROLS =
    'input:not([type="button"],[type="checkbox"],[type="radio"],[type="submit"],[type="reset"]),textarea,select,[contenteditable]:not([contenteditable="false"])';

const INTERACTIVE = 'button,a[href],label,[role="button"],summary';

function axisOf(directions: readonly SwipeDirection[]): "x" | "y" {
    return directions.some(
        (direction) => direction === "up" || direction === "down",
    )
        ? "y"
        : "x";
}

/**
 * Whether an element between `target` and `root` would scroll for a pointer moving by `delta`
 * along `axis`: a pointer moving down scrolls its content up (towards its start), so a scroller
 * that is not at its start takes it; moving up, one not at its end (scroll containment: a drawer's
 * content scrolls before the drawer moves).
 */
function scrollsFirst(
    target: Element,
    root: Element,
    axis: "x" | "y",
    delta: number,
): boolean {
    const view = root.ownerDocument.defaultView;
    for (
        let node: Element | null = target;
        node !== null && node !== root.parentElement;
        node = node.parentElement
    ) {
        if (!(node instanceof HTMLElement)) {
            continue;
        }
        const overflow =
            view?.getComputedStyle(node)[
                axis === "y" ? "overflowY" : "overflowX"
            ];
        if (overflow !== "auto" && overflow !== "scroll") {
            continue;
        }
        const position =
            axis === "y" ? node.scrollTop : Math.abs(node.scrollLeft);
        const max =
            axis === "y"
                ? node.scrollHeight - node.clientHeight
                : node.scrollWidth - node.clientWidth;
        if (max <= 0) {
            continue;
        }
        if (delta > 0 ? position > 0 : position < max - 1) {
            return true;
        }
    }
    return false;
}

interface Sample {
    time: number;
    x: number;
    y: number;
}

/**
 * Watches `element` for swipes (spec/drawer.md, "Swipe"): a primary pointer goes down on it, and
 * once it moved `SWIPE_LOCK_DISTANCE` px, the gesture locks on the swipe's axis (it becomes a
 * swipe, with pointer capture) or is let go (the other axis, or a scroller under the pointer that
 * takes the move: scroll containment). A touch's moves are kept from scrolling the page while they
 * may be a swipe (a non-passive `touchmove`), so the browser does not cancel the pointer. It holds
 * no state of the component: it reports the movement and the release velocity, and the framework
 * decides what they mean (`swipeRelease`). Text selection is cleared and kept off while a swipe
 * runs. Returns the cleanup, which cancels a running swipe.
 */
export function watchSwipe(
    element: HTMLElement,
    options: SwipeOptions,
): () => void {
    const doc = element.ownerDocument;
    const view = doc.defaultView;
    const axis = axisOf(options.directions);
    let gesture: {
        pointerId: number;
        pointerType: string;
        target: Element;
        x: number;
        y: number;
        started: boolean;
        samples: Sample[];
        restoreSelect: (() => void) | null;
    } | null = null;

    const movement = (event: PointerEvent): SwipeMovement => ({
        deltaX: gesture ? event.clientX - gesture.x : 0,
        deltaY: gesture ? event.clientY - gesture.y : 0,
    });

    const stopListening = () => {
        view?.removeEventListener("pointermove", onMove);
        view?.removeEventListener("pointerup", onUp);
        view?.removeEventListener("pointercancel", onCancel);
        element.removeEventListener("lostpointercapture", onLost);
    };

    const finish = (end: SwipeEnd | null, event: PointerEvent | null) => {
        const current = gesture;
        gesture = null;
        stopListening();
        if (current === null || !current.started) {
            return;
        }
        current.restoreSelect?.();
        try {
            if (element.hasPointerCapture(current.pointerId)) {
                element.releasePointerCapture(current.pointerId);
            }
        } catch {
            // already released
        }
        options.onEnd(end, event);
    };

    const velocity = (samples: Sample[], now: number) => {
        const last = samples.at(-1);
        if (last === undefined || now - last.time > RELEASE_REST) {
            return { velocityX: 0, velocityY: 0 };
        }
        const first =
            samples.find(
                (sample) => last.time - sample.time <= VELOCITY_WINDOW,
            ) ?? last;
        const elapsed = last.time - first.time;
        if (elapsed <= 0) {
            return { velocityX: 0, velocityY: 0 };
        }
        return {
            velocityX: (last.x - first.x) / elapsed,
            velocityY: (last.y - first.y) / elapsed,
        };
    };

    const onMove = (event: PointerEvent) => {
        if (gesture === null || event.pointerId !== gesture.pointerId) {
            return;
        }
        const { deltaX, deltaY } = movement(event);
        gesture.samples.push({
            time: event.timeStamp,
            x: event.clientX,
            y: event.clientY,
        });
        if (gesture.samples.length > 32) {
            gesture.samples.shift();
        }
        if (!gesture.started) {
            const along = axis === "y" ? deltaY : deltaX;
            const across = axis === "y" ? deltaX : deltaY;
            if (
                Math.max(Math.abs(along), Math.abs(across)) <
                SWIPE_LOCK_DISTANCE
            ) {
                return;
            }
            if (
                Math.abs(across) > Math.abs(along) ||
                scrollsFirst(gesture.target, element, axis, along)
            ) {
                // another axis, or a scroller under the pointer takes it: no swipe
                gesture = null;
                stopListening();
                return;
            }
            gesture.started = true;
            try {
                element.setPointerCapture(event.pointerId);
            } catch {
                // a synthetic pointer: the window listeners still follow it
            }
            doc.getSelection()?.removeAllRanges();
            const style = doc.documentElement.style;
            const previous = style.userSelect;
            style.userSelect = "none";
            gesture.restoreSelect = () => {
                style.userSelect = previous;
            };
            options.onStart(event);
        }
        options.onMove({ deltaX, deltaY }, event);
    };

    const onUp = (event: PointerEvent) => {
        if (gesture === null || event.pointerId !== gesture.pointerId) {
            return;
        }
        const end = {
            ...movement(event),
            ...velocity(gesture.samples, event.timeStamp),
        };
        finish(end, event);
    };

    const onCancel = (event: PointerEvent) => {
        if (gesture !== null && event.pointerId === gesture.pointerId) {
            finish(null, event);
        }
    };

    const onLost = (event: Event) => {
        // a release lets the capture go before `pointerup` reaches the window: that one ends it;
        // a touch's implicit capture by its target, which the swipe's own capture replaces, bubbles
        // here and ends nothing
        if (event.target === element && gesture?.started) {
            view?.setTimeout(() => {
                if (gesture?.started) {
                    finish(null, event as PointerEvent);
                }
            }, 0);
        }
    };

    const onDown = (event: PointerEvent) => {
        if (gesture !== null || !event.isPrimary) {
            return;
        }
        const target = event.target;
        if (!(target instanceof Element) || !element.contains(target)) {
            return;
        }
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }
        if (
            target.closest("[data-swipe-ignore]") !== null ||
            target.closest(TEXT_CONTROLS) !== null ||
            target.closest('input[type="range"]') !== null ||
            (event.pointerType === "mouse" &&
                target.closest(INTERACTIVE) !== null)
        ) {
            return;
        }
        if (options.canStart && !options.canStart(target, event)) {
            return;
        }
        gesture = {
            pointerId: event.pointerId,
            pointerType: event.pointerType,
            target,
            x: event.clientX,
            y: event.clientY,
            started: false,
            samples: [
                { time: event.timeStamp, x: event.clientX, y: event.clientY },
            ],
            restoreSelect: null,
        };
        view?.addEventListener("pointermove", onMove);
        view?.addEventListener("pointerup", onUp);
        view?.addEventListener("pointercancel", onCancel);
        element.addEventListener("lostpointercapture", onLost);
    };

    // a touch that may be a swipe does not scroll the page: the browser would cancel the pointer
    const onTouchMove = (event: TouchEvent) => {
        if (
            gesture === null ||
            gesture.pointerType !== "touch" ||
            !event.cancelable
        ) {
            return;
        }
        if (gesture.started) {
            event.preventDefault();
            return;
        }
        const touch = event.touches[0];
        if (touch === undefined) {
            return;
        }
        const along =
            axis === "y"
                ? touch.clientY - gesture.y
                : touch.clientX - gesture.x;
        const across =
            axis === "y"
                ? touch.clientX - gesture.x
                : touch.clientY - gesture.y;
        if (
            Math.abs(along) >= Math.abs(across) &&
            !scrollsFirst(gesture.target, element, axis, along)
        ) {
            event.preventDefault();
        }
    };

    element.addEventListener("pointerdown", onDown);
    element.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
        element.removeEventListener("pointerdown", onDown);
        element.removeEventListener("touchmove", onTouchMove);
        finish(null, null);
    };
}
