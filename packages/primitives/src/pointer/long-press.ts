import type { Point } from "./safe-area.ts";

export interface LongPressOptions {
    /** How long the pointer must stay down, in ms (default 500: spec/context-menu.md). */
    delay?: number;
    /** How far it may move from where it went down before the press is canceled, in px (default 10). */
    moveTolerance?: number;
    /** The pointer types that long-press (default `["touch"]`: the mouse has its right button). */
    pointerTypes?: readonly string[];
    /** The press lasted `delay`: where it went down, and its `pointerdown`. */
    onLongPress: (point: Point, event: PointerEvent) => void;
}

/**
 * Watches `element` for a long press (spec/context-menu.md, "Pointer"): a pointer of one of
 * `pointerTypes` held down for `delay` without moving beyond `moveTolerance`. A release, a cancel
 * or a larger move before then cancels it. Once a long press fired, the `click` and the
 * `contextmenu` event that follow its release are swallowed (stopped, their default prevented), so
 * they neither activate what is under the finger nor open the browser's menu. Returns the cleanup.
 */
export function watchLongPress(
    element: Element,
    options: LongPressOptions,
): () => void {
    const {
        delay = 500,
        moveTolerance = 10,
        pointerTypes = ["touch"],
    } = options;
    const doc = element.ownerDocument;
    const view = doc.defaultView;
    let timer: number | undefined;
    let start: { x: number; y: number; pointerId: number } | null = null;
    // after a long press: the events its release sends (within a second of it), until the next
    // press
    let swallowing = false;
    let release: number | undefined;
    const stopSwallowing = () => {
        swallowing = false;
        if (release !== undefined) {
            view?.clearTimeout(release);
            release = undefined;
        }
        doc.removeEventListener("pointerup", onRelease, true);
        doc.removeEventListener("pointercancel", onRelease, true);
    };
    const onRelease = () => {
        doc.removeEventListener("pointerup", onRelease, true);
        doc.removeEventListener("pointercancel", onRelease, true);
        release = view?.setTimeout(stopSwallowing, 1000);
    };

    const cancel = () => {
        if (timer !== undefined) {
            view?.clearTimeout(timer);
            timer = undefined;
        }
        start = null;
        doc.removeEventListener("pointermove", onMove, true);
        doc.removeEventListener("pointerup", cancel, true);
        doc.removeEventListener("pointercancel", cancel, true);
    };
    const onMove = (event: PointerEvent) => {
        if (start === null || event.pointerId !== start.pointerId) {
            return;
        }
        if (
            Math.abs(event.clientX - start.x) > moveTolerance ||
            Math.abs(event.clientY - start.y) > moveTolerance
        ) {
            cancel();
        }
    };
    const onDown = (event: PointerEvent) => {
        stopSwallowing();
        cancel();
        if (!pointerTypes.includes(event.pointerType) || !event.isPrimary) {
            return;
        }
        start = {
            x: event.clientX,
            y: event.clientY,
            pointerId: event.pointerId,
        };
        const point = { x: event.clientX, y: event.clientY };
        doc.addEventListener("pointermove", onMove, true);
        doc.addEventListener("pointerup", cancel, true);
        doc.addEventListener("pointercancel", cancel, true);
        timer = view?.setTimeout(() => {
            timer = undefined;
            cancel();
            swallowing = true;
            doc.addEventListener("pointerup", onRelease, true);
            doc.addEventListener("pointercancel", onRelease, true);
            options.onLongPress(point, event);
        }, delay);
    };
    const swallow = (event: Event) => {
        if (!swallowing) {
            return;
        }
        if (event.type === "click") {
            stopSwallowing();
        }
        event.preventDefault();
        event.stopPropagation();
    };
    element.addEventListener("pointerdown", onDown as EventListener);
    doc.addEventListener("click", swallow, true);
    doc.addEventListener("contextmenu", swallow, true);
    return () => {
        cancel();
        stopSwallowing();
        element.removeEventListener("pointerdown", onDown as EventListener);
        doc.removeEventListener("click", swallow, true);
        doc.removeEventListener("contextmenu", swallow, true);
    };
}
