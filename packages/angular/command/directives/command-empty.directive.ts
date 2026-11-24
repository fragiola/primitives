import { computed, Directive, inject } from "@angular/core";
import { injectHost } from "@fragiola/primitives-angular/internal";
import { keepChildren } from "../utils/keep-children.ts";
import { CommandRoot } from "./command-root.directive.ts";

/**
 * A polite live region, always rendered; its children only while no Item is shown and nothing
 * loads, once mounted (spec/command.md): `<div commandEmpty>No results.</div>`. The element stays
 * and the directive takes its child nodes out, keeping them until the list is empty again.
 */
@Directive({
    selector: "[commandEmpty]",
    host: {
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true",
        "data-primitives-part": "command-empty",
    },
})
export class CommandEmpty {
    private readonly root = inject(CommandRoot);
    private readonly shown = computed(
        () => this.root.shownCount() === 0 && !this.root.loading(),
    );

    constructor() {
        keepChildren(injectHost(), this.shown);
    }
}
