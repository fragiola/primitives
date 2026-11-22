import { effect, type Signal } from "@angular/core";
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
        const id = namers.map((namer) => namer()).find((value) => value);
        if (id) {
            host.setAttribute("aria-labelledby", id);
            wrote = true;
        } else if (wrote) {
            host.removeAttribute("aria-labelledby");
            wrote = false;
        }
    });
}
