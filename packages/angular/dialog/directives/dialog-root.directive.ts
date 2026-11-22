import { Directive, forwardRef, input, output } from "@angular/core";
import {
    attachHandle,
    type OpenChangeEvent,
} from "@fragiola/primitives-angular/internal";
import type { DialogHandle } from "../utils/dialog-handle.ts";
import { DialogRootBase } from "./dialog-root-base.ts";

/**
 * Holds the dialog's state (spec/dialog.md); adds nothing to its element, so it usually sits on
 * an `<ng-container dialogRoot [(open)]="open">`. Its `payload()` is the active trigger's payload
 * (`#dialog="dialogRoot"`, `dialog.payload()`); `close()` and `unmount()` are its actions.
 */
@Directive({
    selector: "[dialogRoot]",
    exportAs: "dialogRoot",
    providers: [
        {
            provide: DialogRootBase,
            useExisting: forwardRef(() => DialogRoot),
        },
    ],
})
export class DialogRoot<Payload = unknown> extends DialogRootBase<Payload> {
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
    /** Connects `[dialogTrigger]`s rendered outside the Root (spec/dialog.md, "Detached triggers"). */
    readonly handle = input<DialogHandle<Payload> | undefined>(undefined);
    /** The id of the active trigger, controlled together with `open`. */
    readonly triggerId = input<string | null | undefined>(undefined);
    readonly defaultTriggerId = input<string | null>(null);
    readonly component = "dialog";

    constructor() {
        super();
        attachHandle(this.handle, this);
    }
}
