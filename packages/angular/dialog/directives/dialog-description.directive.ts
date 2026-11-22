import { Directive, inject, input } from "@angular/core";
import { labelId } from "@fragiola/primitives-angular/internal";
import { DialogRootBase } from "./dialog-root-base.ts";

/** Describes the dialog (its id becomes the popup's `aria-describedby`): `<p dialogDescription>`. */
@Directive({
    selector: "[dialogDescription]",
    exportAs: "dialogDescription",
    host: {
        "[attr.data-primitives-part]": "root.part('description')",
        "[attr.id]": "resolvedId()",
    },
})
export class DialogDescription {
    protected readonly root = inject<DialogRootBase>(DialogRootBase);
    readonly id = input<string | undefined>(undefined);
    protected readonly resolvedId = labelId(
        this.id,
        this.root.descriptionId,
        "primitives-dialog-description",
    );
}
