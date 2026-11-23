import { DestroyRef, inject, untracked } from "@angular/core";
import { injectHost } from "./host-element.ts";

/**
 * A disabled link's press (spec/link.md, "Pointer"), shared by Link and Breadcrumbs' Link (not the
 * `/link` entry): a native click listener on the host anchor, in the capture phase, that prevents
 * the click's default (no navigation) and stops it there while `disabled()`, so no listener of the
 * anchor or around it runs after it: the consumer's `(click)` and a `routerLink` on the same anchor
 * included (Angular's `RouterLink` does not check `defaultPrevented`). Button's disabled-press
 * rule, for an anchor. In an injection context.
 */
export function injectLinkPress(disabled: () => boolean): void {
    const host = injectHost();
    const stop = (event: Event) => {
        if (untracked(disabled)) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    };
    host.addEventListener("click", stop, true);
    inject(DestroyRef).onDestroy(() =>
        host.removeEventListener("click", stop, true),
    );
}
