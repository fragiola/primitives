/**
 * A toast's natural height in px (spec/toast.md, "Stacking"): its border box with its inline
 * `height` set to `auto` for the read, since a collapsed stack may give it the frontmost one's.
 */
export function measureToastHeight(element: HTMLElement): number {
    const previous = element.style.height;
    element.style.height = "auto";
    const height = element.offsetHeight;
    element.style.height = previous;
    return height;
}
