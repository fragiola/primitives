import {
    DestroyRef,
    DOCUMENT,
    type EmbeddedViewRef,
    effect,
    inject,
    PLATFORM_ID,
    type Signal,
    TemplateRef,
    untracked,
    ViewContainerRef,
} from "@angular/core";

/**
 * The options of an overlay's structural portal (spec/README.md, API mapping: Angular):
 * `*dialogPortal="{ keepMounted: true }"`, `*dialogPortal="{ container: element }"`, or
 * `*dialogPortal="element"` for a container alone.
 */
export interface OverlayPortalOptions {
    /** Where the content goes (default: the document's `body`). */
    container?: Element | null;
    /**
     * Keeps the content rendered while the overlay is closed (hidden), before its first opening
     * and after an exit ends (default `false`; spec/README.md, "Lifecycle").
     */
    keepMounted?: boolean;
}

/**
 * The structural portal (spec/README.md, API mapping: Angular): renders the directive's template
 * while `mounted()` is true (always with `keepMounted`), and moves its nodes to the end of the
 * container (default: the document's `body`), as React's `createPortal`. The view stays in its
 * declaration's change detection and injectors; Angular inserts later nodes next to their anchors,
 * which moved with it, and removes the nodes wherever they are when it clears the view. When the
 * portal itself is destroyed with an enclosing view (a submenu's portal inside its parent's popup),
 * Angular only detaches that view's own root nodes, so the portal removes the nodes it moved.
 *
 * A server render renders nothing: the content appears once the page runs in the browser
 * (spec/README.md, "Lifecycle"), and the server never reads a `document` it does not have.
 */
export function mountPortal(
    mounted: Signal<boolean>,
    options: Signal<OverlayPortalOptions>,
): void {
    // `"browser"` or `"server"` (`isPlatformServer` lives in @angular/common, not a peer)
    if (inject(PLATFORM_ID) !== "browser") {
        return;
    }
    const doc = inject(DOCUMENT);
    const template = inject(TemplateRef);
    const viewContainer = inject(ViewContainerRef);
    let view: EmbeddedViewRef<unknown> | null = null;
    let moved: Node[] = [];
    inject(DestroyRef).onDestroy(() => {
        // the view's root nodes now (a root `@if` / `@for` adds nodes after the move), and the
        // ones moved at first
        const nodes = new Set<Node>(moved);
        try {
            for (const node of (view?.rootNodes ?? []) as Node[]) {
                nodes.add(node);
            }
        } catch {
            // a view already destroyed with its parent: the nodes moved at first are all we know
        }
        for (const node of nodes) {
            node.parentNode?.removeChild(node);
        }
        moved = [];
    });
    effect(() => {
        const { container, keepMounted = false } = options();
        const show = mounted() || keepMounted;
        const target = container ?? doc.body;
        untracked(() => {
            if (show && view === null) {
                view = viewContainer.createEmbeddedView(template);
                moved = [...(view.rootNodes as Node[])];
                for (const node of moved) {
                    target.appendChild(node);
                }
            } else if (!show && view !== null) {
                viewContainer.clear();
                view = null;
                moved = [];
            }
        });
    });
}

/**
 * The portal's input transform: `*dialogPortal` alone gives `""` (the default container and no
 * option), `*dialogPortal="element"` that element, and `*dialogPortal="{ keepMounted: true }"`
 * the options.
 */
export function portalOptions(value: unknown): OverlayPortalOptions {
    if (typeof Element !== "undefined" && value instanceof Element) {
        return { container: value };
    }
    return typeof value === "object" && value !== null
        ? (value as OverlayPortalOptions)
        : {};
}
