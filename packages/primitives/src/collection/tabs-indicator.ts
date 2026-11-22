/** The Indicator's CSS variables (spec/tabs.md, "API"): the selected tab's box from the list. */
export type TabsIndicatorBox = Record<
    | "--tabs-indicator-inset-inline-start"
    | "--tabs-indicator-inset-block-start"
    | "--tabs-indicator-inline-size"
    | "--tabs-indicator-block-size"
    | "--active-tab-left"
    | "--active-tab-right"
    | "--active-tab-top"
    | "--active-tab-bottom"
    | "--active-tab-width"
    | "--active-tab-height",
    string
>;

/**
 * The selected tab's box relative to its list, as the Indicator's variables (spec/tabs.md, "API"):
 * the logical ones (inline-start measured from the list's right edge when `rtl`, the layout's
 * direction) and Base UI's physical ones, every value in pixels.
 */
export function tabsIndicatorBox(
    list: Element,
    tab: Element,
    rtl: boolean,
): TabsIndicatorBox {
    const listRect = list.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const left = tabRect.left - listRect.left;
    const right = listRect.right - tabRect.right;
    const top = tabRect.top - listRect.top;
    const bottom = listRect.bottom - tabRect.bottom;
    return {
        "--tabs-indicator-inset-inline-start": `${rtl ? right : left}px`,
        "--tabs-indicator-inset-block-start": `${top}px`,
        "--tabs-indicator-inline-size": `${tabRect.width}px`,
        "--tabs-indicator-block-size": `${tabRect.height}px`,
        "--active-tab-left": `${left}px`,
        "--active-tab-right": `${right}px`,
        "--active-tab-top": `${top}px`,
        "--active-tab-bottom": `${bottom}px`,
        "--active-tab-width": `${tabRect.width}px`,
        "--active-tab-height": `${tabRect.height}px`,
    };
}

/**
 * Places a server-rendered Tabs Indicator before hydration (spec/tabs.md, "Server rendering"; Base
 * UI's `renderBeforeHydration`). It runs as an inline script inside the Indicator, as the page
 * parses: `script` is that script, which it removes, so the hydration finds the Indicator as the
 * client renders it. The selected tab is the list's `aria-selected="true"` tab. Self-contained (no
 * import, no closure): a framework writes its source into the page,
 * `` `(${placeTabsIndicator})(document.currentScript)` ``. It sets the variables of
 * {@link tabsIndicatorBox}, computed the same way.
 */
export function placeTabsIndicator(script: Element | null): void {
    const indicator = script?.parentElement;
    script?.remove();
    const list = indicator?.closest('[role="tablist"]');
    const tab = list?.querySelector('[role="tab"][aria-selected="true"]');
    const view = indicator?.ownerDocument.defaultView;
    if (!indicator || !list || !tab || !view) {
        return;
    }
    const listRect = list.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const rtl = view.getComputedStyle(list).direction === "rtl";
    const left = tabRect.left - listRect.left;
    const right = listRect.right - tabRect.right;
    const top = tabRect.top - listRect.top;
    const values: [string, number][] = [
        ["--tabs-indicator-inset-inline-start", rtl ? right : left],
        ["--tabs-indicator-inset-block-start", top],
        ["--tabs-indicator-inline-size", tabRect.width],
        ["--tabs-indicator-block-size", tabRect.height],
        ["--active-tab-left", left],
        ["--active-tab-right", right],
        ["--active-tab-top", top],
        ["--active-tab-bottom", listRect.bottom - tabRect.bottom],
        ["--active-tab-width", tabRect.width],
        ["--active-tab-height", tabRect.height],
    ];
    values.forEach(([name, value]) => {
        indicator.style.setProperty(name, `${value}px`);
    });
}
