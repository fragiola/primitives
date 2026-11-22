import { computed, Directive, input, output, signal } from "@angular/core";
import {
    attachHandle,
    createOverlayRoot,
    type OpenChangeEvent,
    type OverlayActions,
    placementSignal,
} from "@fragiola/primitives-angular/internal";
import type { PopoverHandle } from "../utils/popover-handle.ts";

export interface PopoverState {
    open: boolean;
}

/**
 * Holds the popover's state (spec/popover.md): `<ng-container popoverRoot [(open)]="open">`. Its
 * `payload()` is the active trigger's payload (`#popover="popoverRoot"`); `close()` and
 * `unmount()` are its actions.
 */
@Directive({ selector: "[popoverRoot]", exportAs: "popoverRoot" })
export class PopoverRoot<Payload = unknown> implements OverlayActions {
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    /** Every requested change with its details, before it happens (`details.cancel()` keeps it). */
    readonly openChangeDetails = output<OpenChangeEvent>();
    /** An opening's or a closing's transition has finished (spec/README.md, "Lifecycle"). */
    readonly openChangeComplete = output<boolean>();
    /** Connects `[popoverTrigger]`s rendered outside the Root (spec/popover.md, "Detached triggers"). */
    readonly handle = input<PopoverHandle<Payload> | undefined>(undefined);
    /** The id of the active trigger, controlled together with `open`. */
    readonly triggerId = input<string | null | undefined>(undefined);
    readonly defaultTriggerId = input<string | null>(null);

    readonly overlay = createOverlayRoot(
        this,
        (event) => this.openChangeDetails.emit(event),
        "primitives-popover",
    );
    /** The active trigger's payload. */
    readonly payload = computed(
        () => this.overlay.payload() as Payload | undefined,
    );
    readonly arrow = signal<HTMLElement | null>(null);
    readonly placed = placementSignal({ side: "bottom", align: "center" });
    readonly titleId = signal<string | undefined>(undefined);
    readonly descriptionId = signal<string | undefined>(undefined);
    readonly state = computed<PopoverState>(() => ({
        open: this.overlay.open(),
    }));

    constructor() {
        attachHandle(this.handle, this);
    }

    /** Closes the popover (reason `imperative-action`). */
    close(): void {
        this.overlay.close();
    }

    /** Ends a running exit now, or the exit held by `preventUnmountOnClose()`. */
    unmount(): void {
        this.overlay.unmount();
    }
}
