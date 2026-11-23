/**
 * A SegmentedControl Indicator's CSS variables (spec/segmented-control.md, "API"): the checked
 * Item's box from the Root's padding box.
 */
export type SegmentIndicatorBox = Record<
    | "--segment-indicator-inset-inline-start"
    | "--segment-indicator-inset-block-start"
    | "--segment-indicator-inline-size"
    | "--segment-indicator-block-size"
    | "--segment-indicator-left"
    | "--segment-indicator-right"
    | "--segment-indicator-top"
    | "--segment-indicator-bottom"
    | "--segment-indicator-width"
    | "--segment-indicator-height",
    string
>;

/**
 * The checked Item's box relative to the Root's padding box (where an absolute Indicator is placed
 * from), as the Indicator's variables (spec/segmented-control.md, "API"): the logical ones
 * (inline-start measured from the Root's right padding edge when `rtl`, the layout's direction)
 * and the physical ones, every value in pixels.
 */
export function segmentIndicatorBox(
    root: Element,
    item: Element,
    rtl: boolean,
): SegmentIndicatorBox {
    const rootRect = root.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    // from the padding box: inside the borders (a scrollbar on the end side left out too)
    const left = itemRect.left - rootRect.left - root.clientLeft;
    const top = itemRect.top - rootRect.top - root.clientTop;
    const right = root.clientWidth - left - itemRect.width;
    const bottom = root.clientHeight - top - itemRect.height;
    return {
        "--segment-indicator-inset-inline-start": `${rtl ? right : left}px`,
        "--segment-indicator-inset-block-start": `${top}px`,
        "--segment-indicator-inline-size": `${itemRect.width}px`,
        "--segment-indicator-block-size": `${itemRect.height}px`,
        "--segment-indicator-left": `${left}px`,
        "--segment-indicator-right": `${right}px`,
        "--segment-indicator-top": `${top}px`,
        "--segment-indicator-bottom": `${bottom}px`,
        "--segment-indicator-width": `${itemRect.width}px`,
        "--segment-indicator-height": `${itemRect.height}px`,
    };
}

/**
 * Places a server-rendered SegmentedControl Indicator before hydration
 * (spec/segmented-control.md, "Server rendering"; Base UI's `renderBeforeHydration`, as
 * {@link placeTabsIndicator}). It runs as an inline script inside the Indicator, as the page
 * parses: `script` is that script, which it removes. The Root and its checked Item are found by
 * their part attributes. Self-contained (no import, no closure): a framework writes its source
 * into the page, `` `(${placeSegmentIndicator})(document.currentScript)` ``. It sets the variables
 * of {@link segmentIndicatorBox}, computed the same way.
 */
export function placeSegmentIndicator(script: Element | null): void {
    const indicator = script?.parentElement;
    script?.remove();
    const root = indicator?.closest(
        '[data-primitives-part="segmented-control-root"]',
    );
    const item = root?.querySelector(
        '[data-primitives-part="segmented-control-item"][aria-checked="true"]',
    );
    const view = indicator?.ownerDocument.defaultView;
    if (!indicator || !root || !item || !view) {
        return;
    }
    const rootRect = root.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const rtl = view.getComputedStyle(root).direction === "rtl";
    const left = itemRect.left - rootRect.left - root.clientLeft;
    const top = itemRect.top - rootRect.top - root.clientTop;
    const right = root.clientWidth - left - itemRect.width;
    const values: [string, number][] = [
        ["inset-inline-start", rtl ? right : left],
        ["inset-block-start", top],
        ["inline-size", itemRect.width],
        ["block-size", itemRect.height],
        ["left", left],
        ["right", right],
        ["top", top],
        ["bottom", root.clientHeight - top - itemRect.height],
        ["width", itemRect.width],
        ["height", itemRect.height],
    ];
    values.forEach(([name, value]) => {
        indicator.style.setProperty(
            `--segment-indicator-${name}`,
            `${value}px`,
        );
    });
}
