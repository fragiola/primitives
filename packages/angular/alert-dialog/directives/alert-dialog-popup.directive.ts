import { Directive, inject } from "@angular/core";
import {
    DIALOG_NESTING,
    DialogPopup,
    DialogRootBase,
} from "@fragiola/primitives-angular/dialog";

/**
 * The `alertdialog`, Dialog's Popup (spec/alert-dialog.md): focus trap, inert page, scroll lock,
 * no outside dismissal, its first Close focused on open. `<div alertDialogPopup>`.
 */
@Directive({
    selector: "[alertDialogPopup]",
    exportAs: "alertDialogPopup",
    providers: [
        {
            provide: DIALOG_NESTING,
            useFactory: () => inject<DialogRootBase>(DialogRootBase).nesting,
        },
    ],
})
export class AlertDialogPopup extends DialogPopup {}
