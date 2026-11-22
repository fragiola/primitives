// The entry of @fragiola/primitives/swipe: swipe gestures (pointer and touch, with scroll containment), their release, and snap points.

export {
    type ResolvedSnapPoint,
    resolveSnapPoints,
    type SnapPoint,
    type SwipeOutcome,
    swipeDisplacement,
    swipeMovement,
    swipeProgress,
    swipeRelease,
} from "./swipe-release.ts";
export {
    SWIPE_LOCK_DISTANCE,
    type SwipeDirection,
    type SwipeEnd,
    type SwipeMovement,
    type SwipeOptions,
    watchSwipe,
} from "./watch-swipe.ts";
