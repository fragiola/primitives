/** The smallest thumb, in pixels (spec/scroll-area.md, "Measurement"; Base UI's). */
export const MIN_THUMB_SIZE = 16;

/** A position within this many pixels of an edge counts as the edge. */
const EDGE_TOLERANCE = 1;

/**
 * A scroll position as a distance from the start of its range, clamped to `[0, max]`, and moved
 * onto an edge when it is within 1 px of it (subpixel scrolling ends a pixel short).
 */
export function scrollFromStart(position: number, max: number): number {
    if (max <= 0) {
        return 0;
    }
    const clamped = Math.min(max, Math.max(0, position));
    const atStart = clamped <= EDGE_TOLERANCE;
    const atEnd = max - clamped <= EDGE_TOLERANCE;
    if (atStart && atEnd) {
        return clamped <= max - clamped ? 0 : max;
    }
    if (atStart) {
        return 0;
    }
    return atEnd ? max : clamped;
}

export interface ThumbGeometryInput {
    /** The viewport's size along the axis (`clientHeight`, `clientWidth`). */
    clientSize: number;
    /** The content's size along the axis (`scrollHeight`, `scrollWidth`). */
    scrollSize: number;
    /** The scroll's distance from the start of its range (`scrollFromStart`). */
    fromStart: number;
    /** The track's room: its size less its padding and the thumb's margins. */
    room: number;
}

export interface ThumbGeometry {
    /** The thumb's size along the axis, in pixels. */
    size: number;
    /** Its offset from the start of the track's room, in pixels. */
    offset: number;
}

/**
 * A thumb's size (the room times the visible fraction, at least `MIN_THUMB_SIZE`) and offset (the
 * scroll's fraction of its range times the room the thumb leaves).
 */
export function thumbGeometry({
    clientSize,
    scrollSize,
    fromStart,
    room,
}: ThumbGeometryInput): ThumbGeometry {
    const visible = scrollSize > 0 ? Math.min(1, clientSize / scrollSize) : 1;
    const size = Math.max(MIN_THUMB_SIZE, Math.max(0, room) * visible);
    const max = Math.max(0, scrollSize - clientSize);
    const free = room - size;
    const offset = max > 0 && free > 0 ? (fromStart / max) * free : 0;
    return { size, offset };
}

/**
 * The scroll distance from the start that a thumb offset stands for (a drag's or a track
 * press's), clamped to the range.
 */
export function scrollForThumbOffset(
    offset: number,
    free: number,
    max: number,
): number {
    if (free <= 0 || max <= 0) {
        return 0;
    }
    return Math.min(max, Math.max(0, (offset / free) * max));
}
