import {
    booleanAttribute,
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
import {
    createDelayGroup,
    createHoverIntent,
} from "@fragiola/primitives/hover";
import { interceptEscape } from "@fragiola/primitives/layers";
import { trackHoverBridge } from "@fragiola/primitives/pointer";
import {
    attachHandle,
    type ChangeReason,
    createOverlayRoot,
    type OpenChangeEvent,
    type OverlayActions,
    placementSignal,
} from "@fragiola/primitives-angular/internal";
import type { TooltipHandle } from "../utils/tooltip-handle.ts";
import { TooltipProvider } from "./tooltip-provider.directive.ts";

export interface TooltipState {
    open: boolean;
    instant: boolean;
}

/**
 * Holds the tooltip's state and its hover intent; renders no element (spec/tooltip.md):
 * `<ng-container tooltipRoot [(open)]="open" [delay]="500">`. Its `payload()` is the active
 * trigger's payload (`#tooltip="tooltipRoot"`); `close()` and `unmount()` are its actions.
 */
@Directive({ selector: "[tooltipRoot]", exportAs: "tooltipRoot" })
export class TooltipRoot<Payload = unknown> implements OverlayActions {
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    /** Every requested change with its details, before it happens (`details.cancel()` keeps it). */
    readonly openChangeDetails = output<OpenChangeEvent>();
    /** An opening's or a closing's transition has finished (spec/README.md, "Lifecycle"). */
    readonly openChangeComplete = output<boolean>();
    /** Connects `[tooltipTrigger]`s rendered outside the Root (spec/tooltip.md, "Detached triggers"). */
    readonly handle = input<TooltipHandle<Payload> | undefined>(undefined);
    /** The id of the active trigger, controlled together with `open`. */
    readonly triggerId = input<string | null | undefined>(undefined);
    readonly defaultTriggerId = input<string | null>(null);
    /** ms before a hovered trigger opens (default: the Provider's, else 600). */
    readonly delay = input<number | undefined>(undefined);
    /** ms before it closes once the pointer left (default: the Provider's, else 0). */
    readonly closeDelay = input<number | undefined>(undefined);
    readonly disabled = input(false, { transform: booleanAttribute });

    readonly overlay = createOverlayRoot(
        this,
        (event) => this.openChangeDetails.emit(event),
        "primitives-tooltip",
    );
    /** The active trigger's payload. */
    readonly payload = computed(
        () => this.overlay.payload() as Payload | undefined,
    );
    readonly arrow = signal<HTMLElement | null>(null);
    readonly placed = placementSignal({ side: "top", align: "center" });
    readonly instant = signal(false);
    readonly state = computed<TooltipState>(() => ({
        open: this.overlay.open(),
        instant: this.instant(),
    }));

    private readonly provider = inject(TooltipProvider, { optional: true });
    // a Root outside any Provider is alone in its own group
    private readonly ownGroup = createDelayGroup({ timeout: 0 });
    private readonly intent = createHoverIntent({
        open: () =>
            this.show(
                "trigger-hover",
                false,
                this.pendingEvent,
                this.pendingTrigger,
            ),
        close: () => this.hide("trigger-hover"),
    });
    // the trigger the pointer is over, and the one a pending hover delay opens from
    private hovered: HTMLElement | null = null;
    private pendingTrigger: HTMLElement | null = null;
    private pendingEvent: Event | undefined;
    /** A press on the trigger blocks reopening until the pointer leaves. */
    private blocked = false;
    private openedByHover = false;
    /** How the group closes this tooltip when another one opens. */
    private readonly member = () => this.hide("trigger-hover");

    constructor() {
        const overlay = this.overlay;
        attachHandle(this.handle, this);
        inject(DestroyRef).onDestroy(() => {
            this.intent.cancel();
            // a tooltip destroyed while open leaves its group, or the group keeps it as open
            this.leaveGroup();
        });

        // The group hears this tooltip open and close. An open from an event joins in `show`
        // (closing the previous member renders at once, which an effect must not do); an open
        // the consumer made (`[open]`) joins in a microtask, out of the effect.
        effect(() => {
            const open = overlay.open();
            untracked(() => {
                if (open && !this.joined) {
                    queueMicrotask(() => {
                        if (untracked(overlay.open)) {
                            this.joinGroup();
                        }
                    });
                } else if (!open) {
                    this.leaveGroup();
                }
            });
        });

        // a hover-opened tooltip closes once the pointer leaves the trigger, the popup and the gap
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
                        // over another of its triggers: the tooltip is moving there (a trigger
                        // removed while hovered is none: it never reports the pointer leaving)
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
                        intent.leave(untracked(this.closeAfter));
                    },
                }),
            );
        });

        // Escape closes it and stops there: an enclosing layer stays open
        effect((onCleanup) => {
            const open = overlay.open();
            const trigger = overlay.trigger();
            if (!open || trigger === null) {
                return;
            }
            onCleanup(
                interceptEscape(trigger.ownerDocument, (event) => {
                    this.intent.cancel();
                    this.hide("escape-key", event);
                }),
            );
        });
    }

    /** Whether this tooltip is its group's open member. */
    private joined = false;

    private joinGroup(): void {
        if (!this.joined) {
            this.joined = true;
            this.group().opened(this.member);
        }
    }

    private leaveGroup(): void {
        if (this.joined) {
            this.joined = false;
            this.group().closed(this.member);
        }
    }

    private group() {
        return this.provider?.group() ?? this.ownGroup;
    }

    private readonly openAfter = computed(
        () => this.delay() ?? this.provider?.delay() ?? 600,
    );
    private readonly closeAfter = computed(
        () => this.closeDelay() ?? this.provider?.closeDelay() ?? 0,
    );

    /**
     * Opens now, from `from` (default: the active trigger); `instant` when no delay ran (focus,
     * the group's hand-off, a move to another trigger).
     */
    show(
        reason: ChangeReason,
        instant: boolean,
        event?: Event,
        from?: HTMLElement | null,
    ): void {
        const previous = { hover: this.openedByHover, instant: this.instant() };
        // set before the change renders (its popup carries `data-instant` from its first frame)
        this.openedByHover = reason === "trigger-hover";
        this.instant.set(instant);
        if (!this.overlay.setOpen(true, reason, event, from)) {
            this.openedByHover = previous.hover;
            this.instant.set(previous.instant);
            return;
        }
        // one open tooltip per group: the previous one closes
        if (untracked(this.overlay.open)) {
            this.joinGroup();
        }
    }

    hide(reason: ChangeReason, event?: Event): void {
        this.overlay.setOpen(false, reason, event);
    }

    /** A trigger's hover: starts the delay (or opens at once in a hand-off or a move). */
    hoverStart(from: HTMLElement, event: Event): void {
        this.hovered = from;
        if (this.disabled() || this.blocked) {
            return;
        }
        if (this.overlay.open()) {
            this.intent.cancel();
            // another trigger of the open tooltip: it moves there at once (spec/tooltip.md)
            if (from !== this.overlay.trigger()) {
                this.show("trigger-hover", true, event, from);
            }
        } else if (this.group().isInstant()) {
            this.intent.cancel();
            this.show("trigger-hover", true, event, from);
        } else {
            this.pendingTrigger = from;
            this.pendingEvent = event;
            this.intent.enter(this.openAfter());
        }
    }

    hoverEnd(from: HTMLElement): void {
        if (this.hovered === from) {
            this.hovered = null;
        }
        this.blocked = false;
        if (!this.overlay.open()) {
            this.intent.cancel();
        }
    }

    /** A press on a trigger closes and blocks reopening until the pointer leaves. */
    press(event: Event): void {
        this.blocked = true;
        this.intent.cancel();
        if (this.overlay.open()) {
            this.hide("trigger-press", event);
        }
    }

    /** Closes the tooltip (reason `imperative-action`). */
    close(): void {
        this.overlay.close();
    }

    /** Ends a running exit now, or the exit held by `preventUnmountOnClose()`. */
    unmount(): void {
        this.overlay.unmount();
    }
}
