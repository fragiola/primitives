import type { Align, Side } from "@fragiola/primitives/positioning";
import type { InjectionKey, Ref, ShallowRef } from "vue";
import type { OverlayRoot } from "../../composables/use-overlay-root.ts";

export interface HoverCardContext extends OverlayRoot {
    /** A trigger's hover or keyboard focus: starts the delay (or moves an open card at once). */
    intentStart: (
        reason: "trigger-hover" | "trigger-focus",
        trigger: HTMLElement,
        event: Event,
    ) => void;
    hoverEnd: (trigger: HTMLElement) => void;
    /** A trigger's blur: closes the card unless focus went into it. */
    blur: (trigger: HTMLElement, event: FocusEvent) => void;
    instant: Ref<boolean>;
    arrow: ShallowRef<HTMLElement | null>;
    placed: Ref<{ side: Side; align: Align }>;
}

export const HoverCardKey: InjectionKey<HoverCardContext> = Symbol("HoverCard");
