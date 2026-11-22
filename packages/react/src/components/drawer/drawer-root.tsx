import type { SnapPoint, SwipeDirection } from "@fragiola/primitives/swipe";
import {
    type ReactNode,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { DialogContext } from "../dialog/dialog-context.ts";
import {
    DialogRootBase,
    type DialogRootSharedProps,
} from "../dialog/dialog-root-base.tsx";
import {
    DrawerContext,
    type DrawerContextValue,
    type DrawerSwipeState,
} from "./drawer-context.ts";
import type { DrawerHandle } from "./drawer-handle.ts";

export interface DrawerRootProps<Payload = unknown>
    extends DialogRootSharedProps<Payload> {
    /** Connects Triggers rendered outside the Root (spec/drawer.md, "Detached triggers"). */
    handle?: DrawerHandle<Payload>;
    /** The edge a swipe dismisses it towards (default `"down"`: a bottom sheet). */
    swipeDirection?: SwipeDirection;
    /** The heights it rests at (spec/drawer.md, "Snap points"); vertical directions only. */
    snapPoints?: readonly SnapPoint[];
    /** The active snap point, controlled. */
    snapPoint?: SnapPoint | null;
    /** The snap point it opens on, uncontrolled (default: the first of `snapPoints`). */
    defaultSnapPoint?: SnapPoint | null;
    onSnapPointChange?: (
        snapPoint: SnapPoint | null,
        details: ChangeDetails,
    ) => void;
}

const AT_REST: DrawerSwipeState = { swiping: false, progress: 0 };

/**
 * Holds the drawer's state; renders no element (spec/drawer.md). Its parts are Dialog's, named
 * `drawer-*`, plus the swipe and the snap points.
 */
export function DrawerRoot<Payload = unknown>({
    swipeDirection = "down",
    snapPoints,
    snapPoint: snapPointProp,
    defaultSnapPoint,
    onSnapPointChange,
    children,
    ...props
}: DrawerRootProps<Payload>) {
    const initial = defaultSnapPoint ?? snapPoints?.[0] ?? null;
    const [snapPoint, setSnapPoint] = useControllableState<
        SnapPoint | null,
        ChangeDetails
    >(snapPointProp, initial, onSnapPointChange);
    const [swipe, setSwipe] = useState<DrawerSwipeState>(AT_REST);
    const latest = useRef({ initial, snapPoint });
    latest.current = { initial, snapPoint };
    // an opening (the change of `open` to true, a controlled one included) starts at rest, on the
    // default snap point again (spec/drawer.md, "API")
    const onOpening = useCallback(() => {
        setSwipe(AT_REST);
        const { initial: start, snapPoint: current } = latest.current;
        if (!Object.is(start, current)) {
            setSnapPoint(start, { reason: "none" });
        }
    }, [setSnapPoint]);
    const drawer: DrawerContextValue = useMemo(
        () => ({
            swipeDirection,
            snapPoints,
            snapPoint: snapPoints === undefined ? null : snapPoint,
            setSnapPoint,
            swipe,
            setSwipe,
        }),
        [swipeDirection, snapPoints, snapPoint, setSnapPoint, swipe],
    );
    return (
        <DialogRootBase {...props} component="drawer">
            {(state: { payload: Payload | undefined }): ReactNode => (
                <DrawerContext.Provider value={drawer}>
                    <DrawerOpening onOpening={onOpening} />
                    {typeof children === "function"
                        ? children(state)
                        : children}
                </DrawerContext.Provider>
            )}
        </DialogRootBase>
    );
}

/** Calls `onOpening` when the dialog's `open` changes to true (not on the first render). */
function DrawerOpening({ onOpening }: { onOpening: () => void }) {
    const { open } = useRequiredContext(DialogContext, "Drawer.Root");
    const previous = useRef(open);
    useLayoutEffect(() => {
        if (open && !previous.current) {
            onOpening();
        }
        previous.current = open;
    }, [open, onOpening]);
    return null;
}
