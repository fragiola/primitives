/** A panel's content size in pixels (spec/collapsible.md, "Animation"). */
export interface PanelSize {
    height: number;
    width: number;
}

/**
 * The size of a panel's content: its `scrollHeight` and `scrollWidth`, which a panel held at
 * `height: 0` by its starting style (with `overflow: hidden`) still reports. The panel must not be
 * `hidden` (a `display: none` element measures 0).
 */
export function measurePanelSize(element: HTMLElement): PanelSize {
    return { height: element.scrollHeight, width: element.scrollWidth };
}

/**
 * Writes a panel's size into its size variables (`--<prefix>-panel-height` and `-width`, in
 * pixels) and applies the styles at once (a style flush), so a transition that starts next (the
 * opening frame without `data-starting-style`, or `data-ending-style`) starts from a length,
 * never from `auto` (spec/collapsible.md, "Animation"). Returns the size, for the framework's
 * state to render the same values.
 */
export function freezePanelSize(
    element: HTMLElement,
    prefix: string,
): PanelSize {
    const size = measurePanelSize(element);
    element.style.setProperty(`--${prefix}-panel-height`, `${size.height}px`);
    element.style.setProperty(`--${prefix}-panel-width`, `${size.width}px`);
    // reading a computed length applies the pending styles: the next change transitions from it
    element.ownerDocument.defaultView?.getComputedStyle(element).height;
    return size;
}

/** The size variables' values (`auto` for no size): what a panel renders. */
export function panelSizeVariables(
    prefix: string,
    size: PanelSize | null,
): Record<string, string> {
    return {
        [`--${prefix}-panel-height`]:
            size === null ? "auto" : `${size.height}px`,
        [`--${prefix}-panel-width`]: size === null ? "auto" : `${size.width}px`,
    };
}

export interface BeforeMatchOptions {
    /** Called when the browser's find-in-page matched the panel's content (`beforematch`). */
    onMatch: (event: Event) => void;
    /** Whether the panel is open now: read after the match, to hide a panel the app kept closed. */
    isOpen: () => boolean;
}

/**
 * Opens a `hidden="until-found"` panel on a find-in-page match (spec/collapsible.md, "Find in
 * page"): the browser fires `beforematch` and removes `hidden`; `onMatch` opens the component.
 * When the component is still closed a task later (a controlled `open` the app kept `false`), the
 * panel gets `hidden="until-found"` back. Returns the cleanup.
 */
export function watchBeforeMatch(
    element: HTMLElement,
    options: BeforeMatchOptions,
): () => void {
    const view = element.ownerDocument.defaultView;
    let timer: number | undefined;
    const onBeforeMatch = (event: Event) => {
        options.onMatch(event);
        if (view === null) {
            return;
        }
        view.clearTimeout(timer);
        timer = view.setTimeout(() => {
            if (!options.isOpen()) {
                element.setAttribute("hidden", "until-found");
            }
        }, 0);
    };
    element.addEventListener("beforematch", onBeforeMatch);
    return () => {
        element.removeEventListener("beforematch", onBeforeMatch);
        view?.clearTimeout(timer);
    };
}
