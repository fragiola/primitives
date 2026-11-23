/** Where a key moves the focus among a field's segments (spec/date-field.md, "Keyboard"). */
export type SegmentMove = "next" | "previous" | "left" | "right" | "first";

/**
 * The focusable segments of `groups` (default: the group `segment` sits in), in their order and
 * each group's document order.
 */
function focusableSegments(
    segment: HTMLElement,
    groups: readonly Element[] | undefined,
): HTMLElement[] {
    const own = segment.closest('[role="group"]');
    const scopes = groups ?? (own === null ? [] : [own]);
    return scopes
        .flatMap((group) => [
            ...group.querySelectorAll<HTMLElement>('[role="spinbutton"]'),
        ])
        .filter((element) => element.tabIndex >= 0);
}

function center(element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    return rect.left + rect.width / 2;
}

/**
 * The segment a move reaches from `segment`: `next` and `previous` in the locale's order (the
 * document's), `left` and `right` on screen, wherever the bidirectional text placed the segments
 * (a he-IL date reads left to right in a right-to-left page), `first` the group's first.
 * `null` when there is none that way. With no layout (every box empty), `right` is `next` and
 * `left` is `previous`. `groups` makes several groups one sequence (a range field's start and end,
 * spec/date-range-field.md "Typing and keys"); by default the moves stay in the segment's group.
 */
export function segmentTarget(
    segment: HTMLElement,
    move: SegmentMove,
    groups?: readonly Element[],
): HTMLElement | null {
    const segments = focusableSegments(segment, groups);
    const index = segments.indexOf(segment);
    if (move === "first") {
        return segments[0] ?? null;
    }
    const laidOut = segments.some(
        (element) => element.getBoundingClientRect().width > 0,
    );
    if (move === "next" || move === "previous" || !laidOut) {
        const step = move === "next" || move === "right" ? 1 : -1;
        return index < 0 ? null : (segments[index + step] ?? null);
    }
    const from = center(segment);
    let best: HTMLElement | null = null;
    let distance = Number.POSITIVE_INFINITY;
    for (const candidate of segments) {
        const offset = center(candidate) - from;
        if (
            candidate !== segment &&
            Math.sign(offset) === (move === "right" ? 1 : -1) &&
            Math.abs(offset) < distance
        ) {
            best = candidate;
            distance = Math.abs(offset);
        }
    }
    return best;
}

/**
 * Focuses the first segment when its field's label is pressed (spec/date-field.md, "In a Field":
 * a label names a group, which no `for` can point at). A press the consumer prevented does
 * nothing. Returns the cleanup.
 */
export function focusOnLabelPress(
    label: HTMLElement,
    target: () => HTMLElement | null,
): () => void {
    const onClick = (event: MouseEvent) => {
        if (event.defaultPrevented) {
            return;
        }
        target()?.focus();
    };
    label.addEventListener("click", onClick);
    return () => label.removeEventListener("click", onClick);
}
