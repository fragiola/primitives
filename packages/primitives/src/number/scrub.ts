/** A point in the viewport, in CSS pixels. */
export interface ScrubPoint {
    x: number;
    y: number;
}

export interface ScrubOptions {
    /** The axis the pointer scrubs along (default `"horizontal"`). */
    direction?: "horizontal" | "vertical";
    /** The distance one step takes, in px (default 2, Base UI). */
    pixelSensitivity?: number;
    /** A press starts a scrub unless this returns `false` (a disabled or read-only field). */
    onStart: (event: PointerEvent) => boolean | undefined;
    /**
     * The pointer moved by `steps` sensitivities along the axis: right or up is positive. Called
     * once per move that crosses at least one.
     */
    onScrub: (steps: number, event: PointerEvent) => void;
    /** The scrub ended: the pointer was released or canceled. */
    onEnd: (event: PointerEvent) => void;
    /**
     * Where the virtual cursor is while the pointer is locked (the real one is hidden), wrapped
     * around the viewport's edges; `null` once it is unlocked or the scrub ended.
     */
    onCursor?: (point: ScrubPoint | null) => void;
}

/**
 * Scrubbing on `element` (spec/number-field.md, "Scrub"): a primary pointer's press starts it,
 * and every `pixelSensitivity` pixels of movement along `direction` is a step, until the pointer
 * is released. A mouse asks for the pointer lock (the movement then never meets the screen's
 * edges, and `onCursor` follows a virtual cursor); a denied lock only leaves the real cursor.
 * The press's default is prevented, so no text is selected. Returns the cleanup.
 */
export function watchScrub(
    element: Element,
    options: ScrubOptions,
): () => void {
    const { direction = "horizontal", pixelSensitivity = 2 } = options;
    const doc = element.ownerDocument;
    const view = doc.defaultView;
    let active: { pointerId: number } | null = null;
    let last: ScrubPoint = { x: 0, y: 0 };
    let cursor: ScrubPoint = { x: 0, y: 0 };
    let pending = 0;

    const locked = () => doc.pointerLockElement === element;
    const end = (event: PointerEvent) => {
        if (active === null || event.pointerId !== active.pointerId) {
            return;
        }
        active = null;
        doc.removeEventListener("pointermove", onMove, true);
        doc.removeEventListener("pointerup", end, true);
        doc.removeEventListener("pointercancel", end, true);
        if (locked()) {
            doc.exitPointerLock();
        }
        options.onCursor?.(null);
        options.onEnd(event);
    };
    const onMove = (event: PointerEvent) => {
        if (active === null || event.pointerId !== active.pointerId) {
            return;
        }
        // locked, the pointer stays where it was: its movement is the event's own
        const isLocked = locked();
        const dx = isLocked ? event.movementX : event.clientX - last.x;
        const dy = isLocked ? event.movementY : event.clientY - last.y;
        last = { x: event.clientX, y: event.clientY };
        if (isLocked && view !== null) {
            const width = view.innerWidth;
            const height = view.innerHeight;
            cursor = {
                x: (((cursor.x + dx) % width) + width) % width,
                y: (((cursor.y + dy) % height) + height) % height,
            };
            options.onCursor?.(cursor);
        }
        pending += direction === "vertical" ? -dy : dx;
        const steps = Math.trunc(pending / pixelSensitivity);
        if (steps !== 0) {
            pending -= steps * pixelSensitivity;
            options.onScrub(steps, event);
        }
    };
    const onDown = (event: PointerEvent) => {
        if (event.button !== 0 || !event.isPrimary || active !== null) {
            return;
        }
        if (options.onStart(event) === false) {
            return;
        }
        event.preventDefault();
        active = { pointerId: event.pointerId };
        last = { x: event.clientX, y: event.clientY };
        cursor = { ...last };
        pending = 0;
        doc.addEventListener("pointermove", onMove, true);
        doc.addEventListener("pointerup", end, true);
        doc.addEventListener("pointercancel", end, true);
        if (event.pointerType === "mouse") {
            try {
                const request = (
                    element as Element & {
                        requestPointerLock?: () => Promise<void> | undefined;
                    }
                ).requestPointerLock?.();
                request?.then(
                    () => {
                        if (!locked()) {
                            return;
                        }
                        if (active === null) {
                            // granted after a quick click ended the scrub: never kept
                            doc.exitPointerLock();
                        } else {
                            options.onCursor?.(cursor);
                        }
                    },
                    () => {},
                );
            } catch {
                // a denied lock leaves the real cursor
            }
        }
    };
    // a lock granted with no promise (Firefox) after the scrub ended is released too
    const onLockChange = () => {
        if (active === null && locked()) {
            doc.exitPointerLock();
        }
    };
    element.addEventListener("pointerdown", onDown as EventListener);
    doc.addEventListener("pointerlockchange", onLockChange);
    return () => {
        element.removeEventListener("pointerdown", onDown as EventListener);
        doc.removeEventListener("pointerlockchange", onLockChange);
        doc.removeEventListener("pointermove", onMove, true);
        doc.removeEventListener("pointerup", end, true);
        doc.removeEventListener("pointercancel", end, true);
        if (active !== null && locked()) {
            doc.exitPointerLock();
        }
        active = null;
    };
}
