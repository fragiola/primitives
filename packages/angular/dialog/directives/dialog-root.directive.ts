import { computed, Directive, input, output, signal } from "@angular/core";
import type { OpenChangeEvent } from "@fragiola/primitives-angular/internal";
import { createOverlayRoot } from "@fragiola/primitives-angular/internal";

export interface DialogState {
    open: boolean;
}

/**
 * Holds the dialog's state (spec/dialog.md); adds nothing to its element, so it usually sits on
 * an `<ng-container dialogRoot [(open)]="open">`.
 */
@Directive({ selector: "[dialogRoot]", exportAs: "dialogRoot" })
export class DialogRoot {
    /** The open state: two-way `[(open)]`, one-way `[open]`, or the dialog's own. */
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    /** Every change of the open state with its reason (`(openChange)` emits the value alone). */
    readonly openChangeDetails = output<OpenChangeEvent>();

    readonly overlay = createOverlayRoot(
        this,
        (event) => this.openChangeDetails.emit(event),
        "primitives-dialog",
    );
    readonly backdrop = signal<HTMLElement | null>(null);
    readonly titleId = signal<string | undefined>(undefined);
    readonly descriptionId = signal<string | undefined>(undefined);
    readonly state = computed<DialogState>(() => ({
        open: this.overlay.open(),
    }));
}
