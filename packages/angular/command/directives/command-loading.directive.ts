import { Directive, inject } from "@angular/core";
import { injectHost } from "@fragiola/primitives-angular/internal";
import { keepChildren } from "../utils/keep-children.ts";
import { CommandRoot } from "./command-root.directive.ts";

/**
 * A polite live region, always rendered; its children only while the Root is `loading`
 * (spec/command.md): `<div commandLoading>Loading…</div>`.
 */
@Directive({
    selector: "[commandLoading]",
    host: {
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true",
        "data-primitives-part": "command-loading",
    },
})
export class CommandLoading {
    private readonly root = inject(CommandRoot);

    constructor() {
        keepChildren(injectHost(), () => this.root.loading());
    }
}
