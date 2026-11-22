import { Directive, inject } from "@angular/core";
import { DialogRootBase } from "./dialog-root-base.ts";

/** Closes the dialog (reason `close-press`): `<button dialogClose>`. */
@Directive({
    selector: "[dialogClose]",
    exportAs: "dialogClose",
    host: {
        type: "button",
        "[attr.data-primitives-part]": "root.part('close')",
        "(click)": "root.overlay.setOpen(false, 'close-press', $event)",
    },
})
export class DialogClose {
    protected readonly root = inject<DialogRootBase>(DialogRootBase);
}
