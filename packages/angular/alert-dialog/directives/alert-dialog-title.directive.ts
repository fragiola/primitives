import { Directive } from "@angular/core";
import { DialogTitle } from "@fragiola/primitives-angular/dialog";

/**
 * Names the alert dialog, Dialog's Title: `<h2 alertDialogTitle>`.
 */
@Directive({
    selector: "[alertDialogTitle]",
    exportAs: "alertDialogTitle",
})
export class AlertDialogTitle extends DialogTitle {}
