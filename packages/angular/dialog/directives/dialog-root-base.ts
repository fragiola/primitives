import {
    computed,
    Directive,
    effect,
    type InputSignal,
    inject,
    type OutputEmitterRef,
    signal,
    untracked,
} from "@angular/core";
import {
    createOverlayRoot,
    type OpenChangeEvent,
    type OverlayActions,
} from "@fragiola/primitives-angular/internal";
import { DIALOG_NESTING, type DialogNesting } from "../utils/dialog-nesting.ts";

/** The component a dialog's parts belong to: their part attribute's prefix. */
export type DialogComponent = "dialog" | "alert-dialog" | "drawer";

export interface DialogState {
    open: boolean;
    nested: boolean;
    nestedDialogOpen: boolean;
}

/**
 * The state of a Dialog's or an AlertDialog's root (spec/alert-dialog.md: built on Dialog's
 * parts), the token every dialog part injects: `[dialogRoot]` and `[alertDialogRoot]` provide it.
 * Its `component` names its parts' part attributes; each root declares the inputs and outputs, and
 * its own `handle`.
 */
@Directive()
export abstract class DialogRootBase<Payload = unknown>
    implements OverlayActions
{
    /**
     * `alert-dialog`: never dismissed from outside, focuses its first Close (spec/alert-dialog.md).
     */
    abstract readonly component: DialogComponent;
    // the inputs and outputs, declared by each root directive (its API, read where it is declared)
    abstract readonly open: InputSignal<boolean | undefined>;
    abstract readonly openChange: OutputEmitterRef<boolean>;
    abstract readonly defaultOpen: InputSignal<boolean>;
    abstract readonly openChangeDetails: OutputEmitterRef<OpenChangeEvent>;
    abstract readonly openChangeComplete: OutputEmitterRef<boolean>;
    abstract readonly triggerId: InputSignal<string | null | undefined>;
    abstract readonly defaultTriggerId: InputSignal<string | null>;

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

    /**
     * Whether its parts name their nested attributes for a drawer (`data-nested-drawer-open`,
     * `--nested-drawers`, spec/drawer.md) rather than a dialog (`data-nested-dialog-open`,
     * `--nested-dialogs`).
     */
    get nestsDrawers(): boolean {
        return this.component === "drawer";
    }

    /** The part attribute value of one of its parts (`dialog-popup`, `alert-dialog-popup`). */
    part(name: string): string {
        return `${this.component}-${name}`;
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
