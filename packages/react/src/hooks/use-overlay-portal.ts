import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const NO_SUBSCRIPTION = () => () => {};
const IN_BROWSER = () => true;
const ON_SERVER = () => false;

/** The props of every overlay's Portal (spec/README.md, "Lifecycle"). */
export interface OverlayPortalProps {
    children?: ReactNode;
    /** Where the content goes (default: `document.body`). */
    container?: Element | null;
    /**
     * Keeps the content rendered while the overlay is closed (hidden), before its first opening
     * and after an exit ends (default `false`).
     */
    keepMounted?: boolean;
}

/**
 * Renders an overlay's portal content into `container` while it is mounted (open, or its exit
 * running), or always with `keepMounted`. Never on a server, nor while a page hydrates: the
 * content appears once it is hydrated (a server render has no portal).
 */
export function useOverlayPortal(
    mounted: boolean,
    { children, container, keepMounted = false }: OverlayPortalProps,
): ReactNode {
    const browser = useSyncExternalStore(
        NO_SUBSCRIPTION,
        IN_BROWSER,
        ON_SERVER,
    );
    if (!browser || (!mounted && !keepMounted)) {
        return null;
    }
    return createPortal(children, container ?? document.body);
}
