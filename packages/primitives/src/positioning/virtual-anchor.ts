/**
 * A rectangle to anchor a floating element to, instead of an element (spec/context-menu.md,
 * "Positioning"): Floating UI's virtual element. `contextElement` is the element it belongs to
 * (the area a context menu opened from): its scroll ancestors and its direction are read.
 */
export interface VirtualAnchor {
    getBoundingClientRect: () => DOMRect;
    contextElement?: Element;
}

/** A point, or a rectangle, in the viewport's (client) coordinates. */
export interface AnchorRect {
    x: number;
    y: number;
    width?: number;
    height?: number;
}

/**
 * A virtual anchor at a fixed point or rectangle of the viewport (the pointer of a right-click): a
 * zero-size rectangle for a point. It does not follow the page's scroll.
 */
export function virtualAnchor(
    rect: AnchorRect,
    contextElement?: Element | null,
): VirtualAnchor {
    const { x, y, width = 0, height = 0 } = rect;
    const box = {
        x,
        y,
        width,
        height,
        top: y,
        left: x,
        right: x + width,
        bottom: y + height,
    };
    return {
        getBoundingClientRect: () => ({ ...box, toJSON: () => box }) as DOMRect,
        ...(contextElement ? { contextElement } : {}),
    };
}

/** Whether an anchor is an element (else a virtual anchor). */
export function isElementAnchor(
    anchor: Element | VirtualAnchor,
): anchor is Element {
    return typeof (anchor as Element).nodeType === "number";
}
