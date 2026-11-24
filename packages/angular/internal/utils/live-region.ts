import { afterNextRender, DestroyRef, inject } from "@angular/core";

/** A polite live region's structural style: visually hidden, still read (Clipboard's announcer's). */
const LIVE_REGION_STYLE = {
    position: "absolute",
    width: "1px",
    height: "1px",
    margin: "-1px",
    padding: "0",
    border: "0",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
} as const;

/**
 * A polite live region (spec/drop-zone.md, spec/file-upload.md), in its directive's injection
 * context: appended as the host's last child after the first render (a server renders none, as
 * Clipboard's announcer), removed with the directive. The entry writes into it with the toolkit's
 * `announceText`.
 */
export function createLiveRegion(
    host: HTMLElement,
    part: string,
): HTMLSpanElement {
    const region = host.ownerDocument.createElement("span");
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    region.setAttribute("data-primitives-part", part);
    Object.assign(region.style, LIVE_REGION_STYLE);
    afterNextRender(() => {
        if (!region.isConnected) {
            host.appendChild(region);
        }
    });
    inject(DestroyRef).onDestroy(() => region.remove());
    return region;
}
