import {
    computed,
    Directive,
    effect,
    inject,
    input,
    output,
    signal,
    untracked,
} from "@angular/core";
import {
    attachHandle,
    createOverlayRoot,
    type OpenChangeEvent,
    type OverlayActions,
} from "@fragiola/primitives-angular/internal";
import type { DialogHandle } from "../utils/dialog-handle.ts";
import { DIALOG_NESTING, type DialogNesting } from "../utils/dialog-nesting.ts";

export interface DialogState {
    open: boolean;
    nested: boolean;
    nestedDialogOpen: boolean;
}

/**
 * Holds the dialog's state (spec/dialog.md); adds nothing to its element, so it usually sits on
 * an `<ng-container dialogRoot [(open)]="open">`. Its `payload()` is the active trigger's payload
 * (`#dialog="dialogRoot"`, `dialog.payload()`); `close()` and `unmount()` are its actions.
 */
@Directive({ selector: "[dialogRoot]", exportAs: "dialogRoot" })
export class DialogRoot<Payload = unknown> implements OverlayActions {
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

    readonly overlay = createOverlayRoot(
        this,
        (event) => this.openChangeDetails.emit(event),
        "primitives-dialog",
    );
    /** The active trigger's payload. */
    readonly payload = computed(
        () => this.overlay.payload() as Payload | undefined,
    );
    readonly backdrop = signal<HTMLElement | null>(null);
    readonly viewport = signal<HTMLElement | null>(null);
    readonly titleId = signal<string | undefined>(undefined);
    readonly descriptionId = signal<string | undefined>(undefined);

    // nested dialogs (spec/dialog.md, "Nested dialogs"): a dialog inside another's Popup reports
    // the open chain below it; this one counts the longest chain of the dialogs nested in it
    private readonly parentNesting = inject(DIALOG_NESTING, { optional: true });
    /** Whether this dialog sits inside another dialog's Popup. */
    readonly nested = this.parentNesting !== null;
    private readonly chains = signal<ReadonlyMap<object, number>>(new Map());
    /** The number of open dialogs nested below this one, as a chain (`--nested-dialogs`). */
    readonly nestedDialogs = computed(() =>
        Math.max(0, ...this.chains().values()),
    );
    /** What this dialog's Popup gives the dialogs nested in it. */
    readonly nesting: DialogNesting = {
        report: (dialog, chain) => {
            this.chains.update((previous) => {
                if (
                    chain === null
                        ? !previous.has(dialog)
                        : previous.get(dialog) === chain
                ) {
                    return previous;
                }
                const next = new Map(previous);
                if (chain === null) {
                    next.delete(dialog);
                } else {
                    next.set(dialog, chain);
                }
                return next;
            });
        },
    };

    readonly state = computed<DialogState>(() => ({
        open: this.overlay.open(),
        nested: this.nested,
        nestedDialogOpen: this.nestedDialogs() > 0,
    }));

    constructor() {
        attachHandle(this.handle, this);
        const parent = this.parentNesting;
        if (parent !== null) {
            effect((onCleanup) => {
                const chain = this.overlay.open()
                    ? 1 + this.nestedDialogs()
                    : 0;
                untracked(() => parent.report(this, chain));
                onCleanup(() => parent.report(this, null));
            });
        }
    }

    /** Closes the dialog (reason `imperative-action`). */
    close(): void {
        this.overlay.close();
    }

    /** Ends a running exit now, or the exit held by `preventUnmountOnClose()`. */
    unmount(): void {
        this.overlay.unmount();
    }
}
