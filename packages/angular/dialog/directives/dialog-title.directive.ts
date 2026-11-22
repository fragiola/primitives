import { Directive, inject, input } from "@angular/core";
import { labelId } from "@fragiola/primitives-angular/internal";
import { DialogRoot } from "./dialog-root.directive.ts";

/** Names the dialog (its id becomes the popup's `aria-labelledby`): `<h2 dialogTitle>`. */
@Directive({
    selector: "[dialogTitle]",
    exportAs: "dialogTitle",
    host: {
        "data-primitives-part": "dialog-title",
        "[attr.id]": "resolvedId()",
    },
})
export class DialogTitle {
    readonly id = input<string | undefined>(undefined);
    protected readonly resolvedId = labelId(
        this.id,
        inject<DialogRoot>(DialogRoot).titleId,
        "primitives-dialog-title",
    );
}
