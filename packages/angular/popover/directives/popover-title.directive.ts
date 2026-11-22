import { Directive, inject, input } from "@angular/core";
import { labelId } from "@fragiola/primitives-angular/internal";
import { PopoverRoot } from "./popover-root.directive.ts";

/** The popover's title (its id becomes the popup's `aria-labelledby`): `<h2 popoverTitle>`. */
@Directive({
    selector: "[popoverTitle]",
    exportAs: "popoverTitle",
    host: {
        "data-primitives-part": "popover-title",
        "[attr.id]": "resolvedId()",
    },
})
export class PopoverTitle {
    readonly id = input<string | undefined>(undefined);
    protected readonly resolvedId = labelId(
        this.id,
        inject<PopoverRoot>(PopoverRoot).titleId,
        "primitives-popover-title",
    );
}
