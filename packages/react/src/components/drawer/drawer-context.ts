import type { SnapPoint, SwipeDirection } from "@fragiola/primitives/swipe";
import { createContext } from "react";
import type { ChangeDetails } from "../../utils/change-details.ts";

/** A swipe's state, which the Popup sets and the Backdrop and Viewport read (spec/drawer.md). */
export interface DrawerSwipeState {
    swiping: boolean;
    /** From `0` to `1`: how far it moved towards closed (`--drawer-swipe-progress`). */
    progress: number;
}

export interface DrawerContextValue {
    swipeDirection: SwipeDirection;
    snapPoints: readonly SnapPoint[] | undefined;
    /** The active snap point (`null` without snap points). */
    snapPoint: SnapPoint | null;
    setSnapPoint: (next: SnapPoint | null, details: ChangeDetails) => void;
    swipe: DrawerSwipeState;
    setSwipe: (state: DrawerSwipeState) => void;
}

export const DrawerContext = createContext<DrawerContextValue | null>(null);
