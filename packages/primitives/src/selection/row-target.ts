/**
 * The option in the row above (`delta` -1) or below (`delta` 1) the option at `index`, in a list
 * laid out in wrapping rows (spec/color-swatch-picker.md, "Keyboard"): measured on the rendered
 * boxes, the nearest row on that side, and in it the option whose horizontal center is the closest
 * to the current one's (the first of two as close). `index` itself when there is no row on that
 * side (the arrows stop at the first and last rows), or -1 when `index` names no option.
 */
export function rowTarget(
    elements: readonly Element[],
    index: number,
    delta: 1 | -1,
): number {
    const current = elements[index];
    if (current === undefined) {
        return -1;
    }
    const from = current.getBoundingClientRect();
    const center = (from.left + from.right) / 2;
    const boxes = elements.map((element) => element.getBoundingClientRect());
    // a box is in another row when it starts below the current one's middle (or ends above it)
    const middle = (from.top + from.bottom) / 2;
    let rowTop: number | null = null;
    for (const box of boxes) {
        const beyond = delta === 1 ? box.top >= middle : box.bottom <= middle;
        if (!beyond) {
            continue;
        }
        if (
            rowTop === null ||
            (delta === 1 ? box.top < rowTop : box.top > rowTop)
        ) {
            rowTop = box.top;
        }
    }
    if (rowTop === null) {
        return index;
    }
    let target = index;
    let distance = Number.POSITIVE_INFINITY;
    boxes.forEach((box, candidate) => {
        if (Math.abs(box.top - rowTop) >= (box.bottom - box.top) / 2) {
            return;
        }
        const away = Math.abs((box.left + box.right) / 2 - center);
        if (away < distance) {
            distance = away;
            target = candidate;
        }
    });
    return target;
}
