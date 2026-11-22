/** Where a newly selected tab sits from the previous one (spec/tabs.md, `data-activation-direction`). */
export type ActivationDirection = "left" | "right" | "up" | "down" | "none";

/**
 * The physical direction from the previously selected tab to the new one, measured on the page
 * (Base UI): `left` / `right` along a horizontal list, `up` / `down` along a vertical one, `none`
 * when either tab is missing or both sit at the same place. In RTL the next tab sits on the left,
 * so it gives `left`.
 */
export function activationDirection(
    previous: Element | null | undefined,
    next: Element | null | undefined,
    orientation: "horizontal" | "vertical",
): ActivationDirection {
    if (!previous || !next || previous === next) {
        return "none";
    }
    const from = previous.getBoundingClientRect();
    const to = next.getBoundingClientRect();
    const [before, after] =
        orientation === "horizontal"
            ? [from.left, to.left]
            : [from.top, to.top];
    if (after < before) {
        return orientation === "horizontal" ? "left" : "up";
    }
    if (after > before) {
        return orientation === "horizontal" ? "right" : "down";
    }
    return "none";
}
