import type { ActivationDirection } from "@fragiola/primitives/collection";
import type { HoverIntent } from "@fragiola/primitives/hover";
import type { Align, Side } from "@fragiola/primitives/positioning";
import type { ComputedRef, InjectionKey, Ref, ShallowRef } from "vue";
import type { TransitionStatus } from "../../composables/use-presence.ts";
import type { ChangeReason } from "../../utils/change-details.ts";

export type NavigationMenuOrientation = "horizontal" | "vertical";

/** How the open Content was opened: the pointer's hover, or a press (and the keyboard). */
export type OpenedBy = "hover" | "press";

export interface NavigationMenuContext {
    /** The open item's value (`null`: closed). */
    value: ComputedRef<string | null>;
    /** The last open item's value: its Content stays while the popup exits. */
    lastValue: Ref<string | null>;
    setValue: (
        next: string | null,
        reason: ChangeReason,
        event?: Event,
        openedBy?: OpenedBy,
    ) => void;
    /**
     * How the open Content was opened, and when the pointer last opened one (a hover opening or
     * switch): a press within 500 ms of it keeps the Content open.
     */
    openedBy: { by: OpenedBy; at: number };
    lastReason: { current: ChangeReason | null };
    orientation: () => NavigationMenuOrientation;
    loopFocus: () => boolean;
    delay: () => number;
    closeDelay: () => number;
    hover: HoverIntent;
    /** The value a hover is about to open. */
    pendingHover: { current: string | null };
    /** The Content that takes focus once it renders (the open key). */
    pendingFocus: { current: string | null };
    nested: boolean;
    root: ShallowRef<HTMLElement | null>;
    triggers: Map<string, HTMLElement>;
    registerTrigger: (value: string, element: HTMLElement) => () => void;
    /** The open (or last open) item's Trigger. */
    activeTrigger: ComputedRef<HTMLElement | null>;
    activationDirection: Ref<ActivationDirection>;
    positioner: ShallowRef<HTMLElement | null>;
    popup: ShallowRef<HTMLElement | null>;
    viewport: ShallowRef<HTMLElement | null>;
    arrow: ShallowRef<HTMLElement | null>;
    placed: Ref<{ side: Side; align: Align }>;
    /** The open Content's size: the popup's size variables. */
    size: Ref<{ width: number; height: number } | null>;
    setSize: (size: { width: number; height: number }) => void;
    /** The popup's layer is open: the open key's focus waits for it (a parent's focus-out). */
    layered: Ref<boolean>;
    presence: {
        mounted: Ref<boolean>;
        status: Ref<TransitionStatus>;
    };
}

export const NavigationMenuKey: InjectionKey<NavigationMenuContext> =
    Symbol("NavigationMenu");

export interface NavigationMenuItemContext {
    value: () => string;
    contentId: string;
    content: ShallowRef<HTMLElement | null>;
}

export const NavigationMenuItemKey: InjectionKey<NavigationMenuItemContext> =
    Symbol("NavigationMenuItem");

/** Inside a Content: a Root here is a nested level. */
export const NavigationMenuContentKey: InjectionKey<boolean> = Symbol(
    "NavigationMenuContent",
);
