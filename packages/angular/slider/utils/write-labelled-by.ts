import {
    DestroyRef,
    effect,
    inject,
    type Signal,
    signal,
    untracked,
} from "@angular/core";
import { ownAttribute } from "@fragiola/primitives-angular/internal";

/**
 * Writes `aria-labelledby` on a slider's element from its namers (spec/slider.md): the Field's
 * label, else the Slider's Label (the first id given), in its directive's injection context. A
 * consumer's own static `aria-labelledby` wins. With no namer, the element's attribute stays the
 * consumer's, static or bound; one that names it and then goes leaves none.
 */
export function writeLabelledBy(
    host: HTMLElement,
    namers: readonly Signal<string | null | undefined>[],
): void {
    const own = ownAttribute("aria-labelledby");
    if (own !== null) {
        return;
    }
    let wrote = false;
    effect(() => {
        const id = firstId(namers);
        if (id) {
            host.setAttribute("aria-labelledby", id);
            wrote = true;
        } else if (wrote) {
            host.removeAttribute("aria-labelledby");
            wrote = false;
        }
    });
}

/**
 * A Thumb's `aria-labelledby` (spec/slider.md, "API"): the first namer's id, only while the element
 * has no `aria-label` or `aria-labelledby` of the consumer's, read live (Epic #49). A bound
 * `[attr.aria-label]`, or a name the consumer sets later, wins, as in React and Vue; the id this
 * wrote is not the consumer's. In its directive's injection context.
 */
export function writeThumbLabelledBy(
    host: HTMLElement,
    namers: readonly Signal<string | null | undefined>[],
): void {
    // the host's name attributes, followed in the browser (a binding is applied after the
    // directive's first effect run, and a later change is no input of the thumb's)
    const names = signal(0);
    const Observer = host.ownerDocument.defaultView?.MutationObserver;
    if (Observer !== undefined) {
        const observer = new Observer(() => names.update((count) => count + 1));
        observer.observe(host, {
            attributes: true,
            attributeFilter: ["aria-label", "aria-labelledby"],
        });
        inject(DestroyRef).onDestroy(() => observer.disconnect());
    }
    let written: string | null = null;
    effect(() => {
        names();
        const id = firstId(namers);
        untracked(() => {
            const current = host.getAttribute("aria-labelledby");
            const consumer =
                host.hasAttribute("aria-label") ||
                (current !== null && current !== written);
            if (consumer || !id) {
                if (written !== null && current === written) {
                    host.removeAttribute("aria-labelledby");
                }
                written = null;
                return;
            }
            // the same value is not written again: each write is a mutation the observer reports
            if (current !== id) {
                host.setAttribute("aria-labelledby", id);
            }
            written = id;
        });
    });
}

function firstId(
    namers: readonly Signal<string | null | undefined>[],
): string | null | undefined {
    return namers.map((namer) => namer()).find((value) => value);
}
