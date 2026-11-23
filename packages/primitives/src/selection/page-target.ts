/**
 * The option a page away from `current` (spec/listbox.md, "Keyboard": PageDown `1`, PageUp
 * `-1`): the farthest option whose far edge is within the scroll container's visible size from
 * the current option's near edge, along the orientation; the last (first) option when the list
 * does not scroll. Measured on the elements (their bounding boxes), so it follows any layout.
 */
export function pageTarget(
    elements: readonly HTMLElement[],
    current: number,
    delta: 1 | -1,
    container: HTMLElement,
    orientation: "horizontal" | "vertical" = "vertical",
): number {
    const last = elements.length - 1;
    const edge = delta === 1 ? last : 0;
    const vertical = orientation === "vertical";
    const visible = vertical ? container.clientHeight : container.clientWidth;
    const total = vertical ? container.scrollHeight : container.scrollWidth;
    const from = elements[current];
    if (from === undefined || total <= visible || visible === 0) {
        return edge;
    }
    const start = from.getBoundingClientRect();
    const origin = vertical
        ? delta === 1
            ? start.top
            : start.bottom
        : delta === 1
          ? start.left
          : start.right;
    let target = current;
    for (
        let index = current + delta;
        index >= 0 && index <= last;
        index += delta
    ) {
        const box = elements[index]?.getBoundingClientRect();
        if (box === undefined) {
            break;
        }
        const far = vertical
            ? delta === 1
                ? box.bottom
                : box.top
            : delta === 1
              ? box.right
              : box.left;
        if (Math.abs(far - origin) > visible) {
            break;
        }
        target = index;
    }
    return target === current
        ? Math.min(Math.max(current + delta, 0), last)
        : target;
}
