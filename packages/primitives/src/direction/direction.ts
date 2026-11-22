export type Direction = "ltr" | "rtl";

/**
 * The reading direction for an element (spec/direction.md): the direction a DirectionProvider
 * gives, when there is one around it (`provided`), else the element's computed `direction` (falls
 * back to `ltr`).
 */
export function getDirection(
    element: Element,
    provided?: Direction | null,
): Direction {
    if (provided === "ltr" || provided === "rtl") {
        return provided;
    }
    const view = element.ownerDocument.defaultView;
    const value = view?.getComputedStyle(element).direction;
    return value === "rtl" ? "rtl" : "ltr";
}
