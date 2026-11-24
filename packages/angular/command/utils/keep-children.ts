import { afterRenderEffect, untracked } from "@angular/core";

/** Renders the host's children only while `shown()`, once mounted. */
export function keepChildren(host: HTMLElement, shown: () => boolean): void {
    const kept = host.ownerDocument.createDocumentFragment();
    afterRenderEffect({
        write: () => {
            const show = shown();
            untracked(() => {
                if (show) {
                    host.append(kept);
                } else {
                    kept.append(...host.childNodes);
                }
            });
        },
    });
}
