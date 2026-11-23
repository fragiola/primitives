import { afterRenderEffect, Directive, inject, untracked } from "@angular/core";
import { injectHost } from "@fragiola/primitives-angular/internal";
import { AutocompleteRoot } from "./autocomplete-root.directive.ts";

/**
 * A polite live region, always rendered; its children are shown only while the list is empty
 * (spec/autocomplete.md): `<div autocompleteEmpty>No suggestion.</div>`. The element stays and the
 * directive takes its child nodes out, keeping them until the list is empty again.
 */
@Directive({
    selector: "[autocompleteEmpty]",
    host: {
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true",
        "data-primitives-part": "autocomplete-empty",
    },
})
export class AutocompleteEmpty {
    private readonly root = inject(AutocompleteRoot);

    constructor() {
        const host = injectHost();
        const kept = host.ownerDocument.createDocumentFragment();
        afterRenderEffect({
            write: () => {
                const empty = this.root.empty();
                untracked(() => {
                    if (empty) {
                        host.append(kept);
                    } else {
                        kept.append(...host.childNodes);
                    }
                });
            },
        });
    }
}
