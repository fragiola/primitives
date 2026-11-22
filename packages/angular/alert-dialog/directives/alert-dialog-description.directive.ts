import { Directive } from "@angular/core";
import { DialogDescription } from "@fragiola/primitives-angular/dialog";

/**
 * Describes the alert dialog (its message), Dialog's Description: `<p alertDialogDescription>`.
 */
@Directive({
    selector: "[alertDialogDescription]",
    exportAs: "alertDialogDescription",
})
export class AlertDialogDescription extends DialogDescription {}
