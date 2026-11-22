import type { ActivationDirection } from "@fragiola/primitives/collection";
import type { HoverIntent } from "@fragiola/primitives/hover";
import type { Align, Side } from "@fragiola/primitives/positioning";
import { createContext, type RefObject } from "react";
import type { TransitionStatus } from "../../hooks/use-presence.ts";
import type { ChangeReason } from "../../utils/change-details.ts";

export type NavigationMenuOrientation = "horizontal" | "vertical";

/** How the open Content was opened: the pointer's hover, or a press (and the keyboard). */
export type OpenedBy = "hover" | "press";

export interface NavigationMenuContextValue {
    /** The open item's value (`null`: closed). */
    value: string | null;
    /** The last open item's value: its Content stays while the popup exits. */
    lastValue: string | null;
    setValue: (
        next: string | null,
        reason: ChangeReason,
        event?: Event,
        openedBy?: OpenedBy,
    ) => void;
    openedBy: RefObject<{ by: OpenedBy; at: number }>;
    lastReason: RefObject<ChangeReason | null>;
    orientation: NavigationMenuOrientation;
    loopFocus: boolean;
    delay: number;
    closeDelay: number;
    hover: HoverIntent;
    /** The value a hover is about to open. */
    pendingHover: RefObject<string | null>;
    /** The Content that takes focus once it renders (the open key). */
    pendingFocus: RefObject<string | null>;
    nested: boolean;
    root: HTMLElement | null;
    setRoot: (element: HTMLElement | null) => void;
    triggers: Map<string, HTMLElement>;
    registerTrigger: (value: string, element: HTMLElement) => () => void;
    /** The open (or last open) item's Trigger. */
    activeTrigger: HTMLElement | null;
    activationDirection: ActivationDirection;
    positioner: HTMLElement | null;
    setPositioner: (element: HTMLElement | null) => void;
    popup: HTMLElement | null;
    setPopup: (element: HTMLElement | null) => void;
    viewport: HTMLElement | null;
    setViewport: (element: HTMLElement | null) => void;
    arrow: HTMLElement | null;
    setArrow: (element: HTMLElement | null) => void;
    placed: { side: Side; align: Align };
    setPlaced: (placed: { side: Side; align: Align }) => void;
    /** The open Content's size: the popup's size variables. */
    size: { width: number; height: number } | null;
    setSize: (size: { width: number; height: number }) => void;
    presence: {
        mounted: boolean;
        status: TransitionStatus;
    };
}

export const NavigationMenuContext =
    createContext<NavigationMenuContextValue | null>(null);

export interface NavigationMenuItemContextValue {
    value: string;
    contentId: string;
    content: HTMLElement | null;
    setContent: (element: HTMLElement | null) => void;
}

export const NavigationMenuItemContext =
    createContext<NavigationMenuItemContextValue | null>(null);

/** Inside a Content: a Root here is a nested level. */
export const NavigationMenuContentContext = createContext(false);
