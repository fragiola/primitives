import { DestroyRef, effect, inject, signal, untracked } from "@angular/core";
import type { FieldControlBinding } from "@fragiola/primitives-angular/field";

/**
 * A slot's `aria-labelledby` inside a Field (spec/otp-field.md, "In a Field"): the Field's label,
 * only while the slot has no `aria-label` or `aria-labelledby` of the consumer's, read live (the
 * consumer's name says the slot's position and wins on every slot). A bound `[attr.aria-label]`
 * is applied after the directive's first effect run, so the name attributes are followed by a
 * `MutationObserver` in the browser, as Slider's Thumb (docs/decisions.md, "A bound Thumb name");
 * the label's id this wrote, or a server render wrote before a hydration, is never the
 * consumer's. Outside a Field, nothing is written. In its directive's injection context.
 */
export function writeSlotLabelledBy(
    field: FieldControlBinding,
    host: HTMLElement,
): void {
    if (!field.inField) {
        return;
    }
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
        const id = field.labelledBy();
        untracked(() => {
            const current = host.getAttribute("aria-labelledby");
            const consumer =
                host.hasAttribute("aria-label") ||
                (current !== null && current !== written && current !== id);
            if (consumer || id === null) {
                // the label's id is never the consumer's (a server render wrote it)
                if (
                    current !== null &&
                    (current === written || current === id)
                ) {
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
