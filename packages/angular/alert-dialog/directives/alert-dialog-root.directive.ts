import { Directive, forwardRef, input, output } from "@angular/core";
import { DialogRootBase } from "@fragiola/primitives-angular/dialog";
import {
    attachHandle,
    type OpenChangeEvent,
} from "@fragiola/primitives-angular/internal";
import type { AlertDialogHandle } from "../utils/alert-dialog-handle.ts";

/**
 * Holds the alert dialog's state (spec/alert-dialog.md); adds nothing to its element:
 * `<ng-container alertDialogRoot [(open)]="open">`. Its parts are Dialog's directives, named
 * `alert-dialog-*`: always modal, never dismissed from outside, its first Close focused on open.
 * Its `payload()` is the active trigger's payload (`#dialog="alertDialogRoot"`); `close()` and
 * `unmount()` are its actions.
 */
@Directive({
    selector: "[alertDialogRoot]",
    exportAs: "alertDialogRoot",
    providers: [
        {
            provide: DialogRootBase,
            useExisting: forwardRef(() => AlertDialogRoot),
        },
    ],
})
export class AlertDialogRoot<
    Payload = unknown,
> extends DialogRootBase<Payload> {
    /** The open state: two-way `[(open)]`, one-way `[open]`, or the dialog's own. */
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    /**
     * Every requested change of the open state with its details, before it happens
     * (`details.cancel()` keeps it; `(openChange)` emits the value alone, only when it happens).
     */
    readonly openChangeDetails = output<OpenChangeEvent>();
    /** An opening's or a closing's transition has finished (spec/README.md, "Lifecycle"). */
    readonly openChangeComplete = output<boolean>();
    /**
     * Connects `[alertDialogTrigger]`s rendered outside the Root (spec/alert-dialog.md, "Detached
     * triggers").
     */
    readonly handle = input<AlertDialogHandle<Payload> | undefined>(undefined);
    /** The id of the active trigger, controlled together with `open`. */
    readonly triggerId = input<string | null | undefined>(undefined);
    readonly defaultTriggerId = input<string | null>(null);
    readonly component = "alert-dialog";

    constructor() {
        super();
        attachHandle(this.handle, this);
    }
}
