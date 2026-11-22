import type { SwipeDirection, SwipeEnd, SwipeMovement } from "./watch-swipe.ts";

/**
 * A snap point (spec/drawer.md, "Snap points"): a fraction of the viewport's height (`0` to `1`),
 * a height in px (a number above `1`), or a string in `px` or `rem`.
 */
export type SnapPoint = number | string;

/** A snap point measured: its height, and the offset that shows that height of the popup. */
export interface ResolvedSnapPoint {
    value: SnapPoint;
    /** The height of the popup it shows, in px (at most the popup's and the viewport's). */
    height: number;
    /** How far the popup is moved towards its edge to show that height, in px (`0`: all of it). */
    offset: number;
}

/** The release of a swipe without snap points: dismiss past this share of the size... */
export const SWIPE_DISMISS_RATIO = 0.5;

/** ...or past this distance at this velocity (px per ms), a flick. */
export const SWIPE_FLICK_DISTANCE = 10;
export const SWIPE_FLICK_VELOCITY = 0.5;

/** A release at this velocity or faster moves the snap target by velocity × this (px). */
const SNAP_VELOCITY_PROJECTION = 300;
const SNAP_MAX_VELOCITY = 4;

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/** The px height of a snap point in a viewport of `viewportHeight`, or `null` when invalid. */
function snapPointHeight(
    point: SnapPoint,
    viewportHeight: number,
    rootFontSize: number,
): number | null {
    if (typeof point === "number") {
        if (!Number.isFinite(point) || point < 0) {
            return null;
        }
        return point <= 1 ? point * viewportHeight : point;
    }
    const text = point.trim();
    const value = Number.parseFloat(text);
    if (!Number.isFinite(value)) {
        return null;
    }
    if (text.endsWith("rem")) {
        return value * rootFontSize;
    }
    return text.endsWith("px") ? value : null;
}

/**
 * Measures `points` for a popup of `popupHeight` in a viewport of `viewportHeight` (spec/drawer.md,
 * "Snap points"): each one's height (clamped to the popup and the viewport) and offset. Invalid
 * points are left out; two points within 1 px of each other count once (the later one).
 */
export function resolveSnapPoints(
    points: readonly SnapPoint[],
    sizes: {
        popupHeight: number;
        viewportHeight: number;
        rootFontSize?: number;
    },
): ResolvedSnapPoint[] {
    const { popupHeight, viewportHeight, rootFontSize = 16 } = sizes;
    if (popupHeight <= 0 || viewportHeight <= 0) {
        return [];
    }
    const max = Math.min(popupHeight, viewportHeight);
    const resolved: ResolvedSnapPoint[] = [];
    for (const value of points) {
        const height = snapPointHeight(value, viewportHeight, rootFontSize);
        if (height === null) {
            continue;
        }
        const clamped = clamp(height, 0, max);
        const duplicate = resolved.findIndex(
            (point) => Math.abs(point.height - clamped) <= 1,
        );
        if (duplicate !== -1) {
            resolved.splice(duplicate, 1);
        }
        resolved.push({
            value,
            height: clamped,
            offset: Math.max(0, popupHeight - clamped),
        });
    }
    return resolved;
}

/** The movement of a swipe along `direction`: positive towards the edge it dismisses to. */
export function swipeDisplacement(
    direction: SwipeDirection,
    movement: SwipeMovement,
): number {
    switch (direction) {
        case "down":
            return movement.deltaY;
        case "up":
            return -movement.deltaY;
        case "right":
            return movement.deltaX;
        case "left":
            return -movement.deltaX;
    }
}

/**
 * The movement to show while a swipe runs (spec/drawer.md, "Swipe"): along `direction` only, as
 * far as the pointer went towards the edge, and damped (the square root) past the fully open
 * position, where `baseOffset` (a snap point's offset) is `0`. Returns the x and y movement in px.
 */
export function swipeMovement(
    direction: SwipeDirection,
    movement: SwipeMovement,
    baseOffset = 0,
): { x: number; y: number } {
    const along = swipeDisplacement(direction, movement);
    const next = baseOffset + along;
    const shown = next >= 0 ? along : -Math.sqrt(-next) - baseOffset;
    const sign = direction === "down" || direction === "right" ? 1 : -1;
    const value = shown * sign;
    return direction === "up" || direction === "down"
        ? { x: 0, y: value }
        : { x: value, y: 0 };
}

/** What a swipe's release does: dismiss, or settle (on a snap point's index, with snap points). */
export type SwipeOutcome =
    | { dismiss: true }
    | { dismiss: false; snapPoint: number | null };

/**
 * What a released swipe does (spec/drawer.md, "Swipe" and "Snap points"). Without snap points, it
 * dismisses when it moved more than half the popup's `size` along `direction`, or at least 10 px
 * at a flick's velocity (0.5 px per ms) towards the edge; otherwise it settles back. With snap
 * points (the popup's `currentOffset` the active one's), the release's target is where it was let
 * go plus, at a flick's velocity or faster, a projection of that velocity (velocity × 300 px, the
 * velocity capped at 4); the closest of the snap points and the closed position (`size`) wins.
 */
export function swipeRelease(
    direction: SwipeDirection,
    end: SwipeEnd,
    size: number,
    snap?: { points: readonly ResolvedSnapPoint[]; currentOffset: number },
): SwipeOutcome {
    const displacement = swipeDisplacement(direction, end);
    const velocity = swipeDisplacement(direction, {
        deltaX: end.velocityX,
        deltaY: end.velocityY,
    });
    if (snap === undefined || snap.points.length === 0) {
        if (displacement <= 0) {
            return { dismiss: false, snapPoint: null };
        }
        const flick =
            velocity >= SWIPE_FLICK_VELOCITY &&
            displacement >= SWIPE_FLICK_DISTANCE;
        return flick ||
            displacement >
                Math.max(size * SWIPE_DISMISS_RATIO, SWIPE_FLICK_DISTANCE)
            ? { dismiss: true }
            : { dismiss: false, snapPoint: null };
    }
    const projection =
        Math.abs(velocity) >= SWIPE_FLICK_VELOCITY
            ? clamp(velocity, -SNAP_MAX_VELOCITY, SNAP_MAX_VELOCITY) *
              SNAP_VELOCITY_PROJECTION
            : 0;
    const target = clamp(
        snap.currentOffset + displacement + projection,
        0,
        size,
    );
    let closest = 0;
    snap.points.forEach((point, index) => {
        const best = snap.points[closest] as ResolvedSnapPoint;
        if (Math.abs(point.offset - target) < Math.abs(best.offset - target)) {
            closest = index;
        }
    });
    const best = snap.points[closest] as ResolvedSnapPoint;
    if (Math.abs(size - target) < Math.abs(best.offset - target)) {
        return { dismiss: true };
    }
    return { dismiss: false, snapPoint: closest };
}

/**
 * How far a running swipe has moved the popup towards its closed position, from `0` (where it
 * was, or fully open) to `1` (closed), for a recipe's `--drawer-swipe-progress` (spec/drawer.md).
 */
export function swipeProgress(
    direction: SwipeDirection,
    movement: SwipeMovement,
    size: number,
    baseOffset = 0,
): number {
    if (size <= 0) {
        return 0;
    }
    const along = swipeDisplacement(direction, movement);
    return clamp((baseOffset + along) / size, 0, 1);
}
