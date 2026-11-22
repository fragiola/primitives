import { Directive } from "@angular/core";
import { DialogClose } from "@fragiola/primitives-angular/dialog";

/**
 * Closes the alert dialog (reason `close-press`), Dialog's Close: `<button alertDialogClose>`,
 * the least destructive answer (focused on open).
 */
@Directive({
    selector: "[alertDialogClose]",
    exportAs: "alertDialogClose",
})
export class AlertDialogClose extends DialogClose {}
