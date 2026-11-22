import type { DelayGroup } from "@fragiola/primitives/hover";
import type { Align, Side } from "@fragiola/primitives/positioning";
import type { InjectionKey, Ref, ShallowRef } from "vue";
import type { OverlayRoot } from "../../composables/use-overlay-root.ts";
import type { ChangeReason } from "../../utils/change-details.ts";

/** A Provider's delays and its delay group (spec/tooltip.md, "Delay group"). */
export interface TooltipProviderContext {
    delay: () => number;
    closeDelay: () => number;
    group: DelayGroup;
}

export const TooltipProviderKey: InjectionKey<TooltipProviderContext> =
    Symbol("TooltipProvider");

export interface TooltipContext extends OverlayRoot {
    /**
     * Opens now, from `trigger` (default: the active one); `instant` when no delay ran (focus,
     * the group's hand-off, a move to another trigger).
     */
    show: (
        reason: ChangeReason,
        instant: boolean,
        event?: Event,
        trigger?: HTMLElement | null,
    ) => void;
    hide: (reason: ChangeReason, event?: Event) => void;
    /** A trigger's hover: starts the delay (or opens at once in a hand-off or a move). */
    hoverStart: (trigger: HTMLElement, event: Event) => void;
    hoverEnd: (trigger: HTMLElement) => void;
    /** A press on a trigger closes and blocks reopening until the pointer leaves. */
    press: (event: Event) => void;
    instant: Ref<boolean>;
    disabled: () => boolean;
    arrow: ShallowRef<HTMLElement | null>;
    placed: Ref<{ side: Side; align: Align }>;
}

export const TooltipKey: InjectionKey<TooltipContext> = Symbol("Tooltip");
