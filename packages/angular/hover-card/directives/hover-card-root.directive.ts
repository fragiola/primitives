import {
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    output,
    signal,
    untracked,
} from "@angular/core";
import { createHoverIntent } from "@fragiola/primitives/hover";
import { trackHoverBridge } from "@fragiola/primitives/pointer";
import {
    attachHandle,
    type ChangeReason,
    createOverlayRoot,
    type OpenChangeEvent,
    type OverlayActions,
    placementSignal,
} from "@fragiola/primitives-angular/internal";
import type { HoverCardHandle } from "../utils/hover-card-handle.ts";

export interface HoverCardState {
    open: boolean;
    instant: boolean;
}

/**
 * Holds the card's state and its hover intent; renders no element (spec/hover-card.md):
 * `<ng-container hoverCardRoot [delay]="500">`. Its `payload()` is the active trigger's payload
 * (`#card="hoverCardRoot"`); `close()` and `unmount()` are its actions.
 */
@Directive({ selector: "[hoverCardRoot]", exportAs: "hoverCardRoot" })
export class HoverCardRoot<Payload = unknown> implements OverlayActions {
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    /** Every requested change with its details, before it happens (`details.cancel()` keeps it). */
    readonly openChangeDetails = output<OpenChangeEvent>();
    /** An opening's or a closing's transition has finished (spec/README.md, "Lifecycle"). */
    readonly openChangeComplete = output<boolean>();
    /** Connects `[hoverCardTrigger]`s rendered outside the Root (spec/hover-card.md). */
    readonly handle = input<HoverCardHandle<Payload> | undefined>(undefined);
    /** The id of the active trigger, controlled together with `open`. */
    readonly triggerId = input<string | null | undefined>(undefined);
    readonly defaultTriggerId = input<string | null>(null);
    /** ms before a hovered or keyboard-focused trigger opens it (default 600). */
    readonly delay = input(600);
    /** ms before it closes once the pointer left the trigger and the card (default 300). */
    readonly closeDelay = input(300);

    readonly overlay = createOverlayRoot(
        this,
        (event) => this.openChangeDetails.emit(event),
        "primitives-hover-card",
    );
    /** The active trigger's payload. */
    readonly payload = computed(
        () => this.overlay.payload() as Payload | undefined,
    );
    readonly arrow = signal<HTMLElement | null>(null);
    readonly placed = placementSignal({ side: "bottom", align: "center" });
    readonly instant = signal(false);
    readonly state = computed<HoverCardState>(() => ({
        open: this.overlay.open(),
        instant: this.instant(),
    }));

    private readonly intent = createHoverIntent({
        open: () =>
            this.show(
                this.pending.reason,
                false,
                this.pending.event,
                this.pending.trigger,
            ),
        close: () => this.hide("trigger-hover"),
    });
    // the trigger the pointer is over, and what a pending delay opens from
    private hovered: HTMLElement | null = null;
    private pending: {
        reason: ChangeReason;
        trigger: HTMLElement | null;
        event: Event | undefined;
    } = { reason: "trigger-hover", trigger: null, event: undefined };
    private openedByHover = false;

    constructor() {
        const overlay = this.overlay;
        attachHandle(this.handle, this);
        inject(DestroyRef).onDestroy(() => this.intent.cancel());

        effect(() => {
            if (!overlay.open()) {
                untracked(() => this.intent.cancel());
            }
        });

        // a hover-opened card closes once the pointer leaves the trigger, the card and the safe
        // area
        effect((onCleanup) => {
            const open = overlay.open();
            const trigger = overlay.trigger();
            const popup = overlay.popup();
            if (!open || !this.openedByHover || trigger === null) {
                return;
            }
            const intent = this.intent;
            onCleanup(
                trackHoverBridge(trigger, popup, {
                    inside: () => intent.cancel(),
                    outside: () => {
                        // over another of its triggers: the card is moving there
                        const other = this.hovered;
                        if (
                            other !== null &&
                            other !== trigger &&
                            other.isConnected &&
                            untracked(overlay.triggers).includes(other)
                        ) {
                            intent.cancel();
                            return;
                        }
                        intent.leave(untracked(this.closeDelay));
                    },
                }),
            );
        });
    }

    /** Opens now, from `from` (default: the active trigger); `instant` when no delay ran. */
    show(
        reason: ChangeReason,
        instant: boolean,
        event?: Event,
        from?: HTMLElement | null,
    ): void {
        const previous = { hover: this.openedByHover, instant: this.instant() };
        this.openedByHover = reason === "trigger-hover";
        this.instant.set(instant);
        if (!this.overlay.setOpen(true, reason, event, from)) {
            this.openedByHover = previous.hover;
            this.instant.set(previous.instant);
        }
    }

    hide(reason: ChangeReason, event?: Event): void {
        this.overlay.setOpen(false, reason, event);
    }

    /** A trigger's hover or keyboard focus: starts the delay (or moves an open card at once). */
    intentStart(
        reason: "trigger-hover" | "trigger-focus",
        from: HTMLElement,
        event: Event,
    ): void {
        if (reason === "trigger-hover") {
            this.hovered = from;
        }
        if (this.overlay.open()) {
            this.intent.cancel();
            // another trigger of the open card: it moves there at once
            if (from !== this.overlay.trigger()) {
                this.show(reason, true, event, from);
            }
            return;
        }
        this.pending = { reason, trigger: from, event };
        this.intent.enter(this.delay());
    }

    hoverEnd(from: HTMLElement): void {
        if (this.hovered === from) {
            this.hovered = null;
        }
        if (!this.overlay.open()) {
            this.intent.cancel();
        }
    }

    /** A trigger's blur: closes the card unless focus went into it. */
    blur(from: HTMLElement, event: FocusEvent): void {
        const overlay = this.overlay;
        if (!overlay.open()) {
            if (this.pending.reason === "trigger-focus") {
                this.intent.cancel();
            }
            return;
        }
        if (from !== overlay.trigger()) {
            return;
        }
        const next = event.relatedTarget;
        if (
            next instanceof Node &&
            (overlay.popup()?.contains(next) ||
                overlay.positioner()?.contains(next))
        ) {
            return;
        }
        this.intent.cancel();
        this.hide("trigger-focus", event);
    }

    /** Closes the card (reason `imperative-action`). */
    close(): void {
        this.overlay.close();
    }

    /** Ends a running exit now, or the exit held by `preventUnmountOnClose()`. */
    unmount(): void {
        this.overlay.unmount();
    }
}
