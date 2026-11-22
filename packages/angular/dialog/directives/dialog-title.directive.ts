import { Directive, inject, input } from "@angular/core";
import { labelId } from "@fragiola/primitives-angular/internal";
import { DialogRootBase } from "./dialog-root-base.ts";

/** Names the dialog (its id becomes the popup's `aria-labelledby`): `<h2 dialogTitle>`. */
@Directive({
    selector: "[dialogTitle]",
    exportAs: "dialogTitle",
    host: {
        "[attr.data-primitives-part]": "root.part('title')",
        "[attr.id]": "resolvedId()",
    },
})
export class DialogTitle {
    protected readonly root = inject<DialogRootBase>(DialogRootBase);
    readonly id = input<string | undefined>(undefined);
    protected readonly resolvedId = labelId(
        this.id,
        this.root.titleId,
        "primitives-dialog-title",
    );
}
