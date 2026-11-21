import { Directive, inject, input } from "@angular/core";
import { labelId } from "@fragiola/primitives-angular/internal";
import { DialogRoot } from "./dialog-root.directive.ts";

/** Describes the dialog (its id becomes the popup's `aria-describedby`): `<p dialogDescription>`. */
@Directive({
    selector: "[dialogDescription]",
    exportAs: "dialogDescription",
    host: {
        "data-primitives-part": "dialog-description",
        "[attr.id]": "resolvedId()",
    },
})
export class DialogDescription {
    readonly id = input<string | undefined>(undefined);
    protected readonly resolvedId = labelId(
        this.id,
        inject(DialogRoot).descriptionId,
        "primitives-dialog-description",
    );
}
