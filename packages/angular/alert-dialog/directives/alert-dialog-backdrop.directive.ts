import { Directive } from "@angular/core";
import { DialogBackdrop } from "@fragiola/primitives-angular/dialog";

/**
 * The layer behind the popup, Dialog's Backdrop: `<div alertDialogBackdrop>` (a nested one
 * renders nothing unless `forceRender`).
 */
@Directive({
    selector: "[alertDialogBackdrop]",
    exportAs: "alertDialogBackdrop",
})
export class AlertDialogBackdrop extends DialogBackdrop {}
