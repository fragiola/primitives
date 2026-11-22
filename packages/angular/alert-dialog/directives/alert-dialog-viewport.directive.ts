import { Directive } from "@angular/core";
import { DialogViewport } from "@fragiola/primitives-angular/dialog";

/**
 * The container the popup sits in, Dialog's Viewport: `<div alertDialogViewport>`; a press on it
 * outside the popup does nothing.
 */
@Directive({
    selector: "[alertDialogViewport]",
    exportAs: "alertDialogViewport",
})
export class AlertDialogViewport extends DialogViewport {}
