import type { SnapPoint, SwipeDirection } from "@fragiola/primitives/swipe";
import type { ComputedRef, InjectionKey, ShallowRef } from "vue";
import type { ChangeDetails } from "../../utils/change-details.ts";

/** A swipe's state, which the Popup sets and the Backdrop and Viewport read (spec/drawer.md). */
export interface DrawerSwipeState {
    swiping: boolean;
    /** From `0` to `1`: how far it moved towards closed (`--drawer-swipe-progress`). */
    progress: number;
}

export interface DrawerContext {
    swipeDirection: ComputedRef<SwipeDirection>;
    snapPoints: ComputedRef<readonly SnapPoint[] | undefined>;
    /** The active snap point (`null` without snap points). */
    snapPoint: ComputedRef<SnapPoint | null>;
    setSnapPoint: (next: SnapPoint | null, details: ChangeDetails) => void;
    swipe: ShallowRef<DrawerSwipeState>;
}

export const DrawerKey: InjectionKey<DrawerContext> = Symbol("Drawer");
