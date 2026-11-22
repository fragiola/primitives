/**
 * Places a server-rendered Tabs Indicator before hydration (spec/tabs.md, "Server rendering"; Base
 * UI's `renderBeforeHydration`). It runs as an inline script inside the Indicator, as the page
 * parses: `script` is that script, which it removes, so the hydration finds the Indicator as the
 * client renders it. The selected tab is the list's `aria-selected="true"` tab. Self-contained (no
 * import, no closure): a framework writes its source into the page,
 * `` `(${placeTabsIndicator})(document.currentScript)` ``.
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
    const values = [
        rtl ? listRect.right - tabRect.right : tabRect.left - listRect.left,
        tabRect.top - listRect.top,
        tabRect.width,
        tabRect.height,
    ];
    [
        "--tabs-indicator-inset-inline-start",
        "--tabs-indicator-inset-block-start",
        "--tabs-indicator-inline-size",
        "--tabs-indicator-block-size",
    ].forEach((name, index) => {
        indicator.style.setProperty(name, `${values[index]}px`);
    });
}
