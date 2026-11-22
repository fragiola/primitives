import {
    type ResolvedSnapPoint,
    resolveSnapPoints,
    swipeMovement,
    swipeProgress,
    swipeRelease,
    watchSwipe,
} from "@fragiola/primitives/swipe";
import {
    type CSSProperties,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import type { PartProps } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { DialogContext } from "../dialog/dialog-context.ts";
import { DialogPopup, type DialogPopupProps } from "../dialog/dialog-popup.tsx";
import { DrawerContext } from "./drawer-context.ts";

export interface DrawerPopupState {
    open: boolean;
    nested: boolean;
    nestedDrawerOpen: boolean;
    swiping: boolean;
    swipeDirection: string;
    expanded: boolean;
}

export interface DrawerPopupProps extends PartProps<DrawerPopupState> {
    /** Focused on open (default: the first tabbable element, else the popup). */
    initialFocus?: DialogPopupProps["initialFocus"];
    /** Focused on close (default: the active trigger, else the element focused before opening). */
    finalFocus?: DialogPopupProps["finalFocus"];
}

interface Sizes {
    popupHeight: number;
    popupWidth: number;
    viewportHeight: number;
    rootFontSize: number;
}

const NO_SIZES: Sizes = {
    popupHeight: 0,
    popupWidth: 0,
    viewportHeight: 0,
    rootFontSize: 16,
};

/**
 * The drawer's dialog (spec/drawer.md): Dialog's Popup, plus the swipe (`watchSwipe` on it), the
 * snap point offset and the movement variables.
 */
export function DrawerPopup({
    className,
    style,
    render,
    ...props
}: DrawerPopupProps) {
    const dialog = useRequiredContext(DialogContext, "Drawer.Popup");
    const drawer = useRequiredContext(DrawerContext, "Drawer.Popup");
    const { open, popup, viewport, setOpen, nested, nestedDialogs } = dialog;
    const { swipeDirection, snapPoints, snapPoint, setSnapPoint, setSwipe } =
        drawer;
    const vertical = swipeDirection === "up" || swipeDirection === "down";
    const [movement, setMovement] = useState({ x: 0, y: 0 });
    const [swiping, setSwiping] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [sizes, setSizes] = useState<Sizes>(NO_SIZES);

    // the sizes the snap points are measured against, while it is shown
    useLayoutEffect(() => {
        if (!open || popup === null) {
            return undefined;
        }
        const doc = popup.ownerDocument;
        const measure = () => {
            const fontSize = Number.parseFloat(
                doc.defaultView?.getComputedStyle(doc.documentElement)
                    .fontSize ?? "",
            );
            const next = {
                popupHeight: popup.offsetHeight,
                popupWidth: popup.offsetWidth,
                viewportHeight:
                    viewport?.offsetHeight || doc.documentElement.clientHeight,
                rootFontSize: Number.isFinite(fontSize) ? fontSize : 16,
            };
            setSizes((previous) =>
                previous.popupHeight === next.popupHeight &&
                previous.popupWidth === next.popupWidth &&
                previous.viewportHeight === next.viewportHeight &&
                previous.rootFontSize === next.rootFontSize
                    ? previous
                    : next,
            );
        };
        measure();
        const View = doc.defaultView?.ResizeObserver;
        if (View === undefined) {
            return undefined;
        }
        const observer = new View(measure);
        observer.observe(popup);
        if (viewport) {
            observer.observe(viewport);
        }
        return () => observer.disconnect();
    }, [open, popup, viewport]);

    const points: ResolvedSnapPoint[] = useMemo(
        () =>
            snapPoints === undefined || !vertical
                ? []
                : resolveSnapPoints(snapPoints, sizes),
        [snapPoints, vertical, sizes],
    );
    const active =
        points.find((point) => Object.is(point.value, snapPoint)) ?? points[0];
    const offset = active?.offset ?? 0;

    // an opening starts at rest
    useLayoutEffect(() => {
        if (open) {
            setMovement({ x: 0, y: 0 });
            setSwiping(false);
            setDismissed(false);
        }
    }, [open]);

    const latest = useRef({ offset, points, sizes, setOpen, setSnapPoint });
    latest.current = { offset, points, sizes, setOpen, setSnapPoint };

    useEffect(() => {
        if (!open || popup === null) {
            return undefined;
        }
        const size = () =>
            vertical
                ? latest.current.sizes.popupHeight || popup.offsetHeight
                : latest.current.sizes.popupWidth || popup.offsetWidth;
        const settle = () => {
            setSwiping(false);
            setMovement({ x: 0, y: 0 });
            setSwipe({ swiping: false, progress: 0 });
        };
        return watchSwipe(popup, {
            directions: [swipeDirection],
            // the mouse selects the Content's text (spec/drawer.md, "Swipe")
            canStart: (target, event) =>
                event.pointerType !== "mouse" ||
                target.closest('[data-primitives-part="drawer-content"]') ===
                    null,
            onStart: () => setSwiping(true),
            onMove: (move) => {
                const base = latest.current.offset;
                setMovement(swipeMovement(swipeDirection, move, base));
                setSwipe({
                    swiping: true,
                    progress: swipeProgress(swipeDirection, move, size(), base),
                });
            },
            onEnd: (end, event) => {
                if (end === null) {
                    settle();
                    return;
                }
                const current = latest.current;
                const outcome = swipeRelease(
                    swipeDirection,
                    end,
                    size(),
                    current.points.length > 0
                        ? {
                              points: current.points,
                              currentOffset: current.offset,
                          }
                        : undefined,
                );
                if (outcome.dismiss) {
                    setSwiping(false);
                    setDismissed(true);
                    setSwipe({ swiping: false, progress: 1 });
                    if (!current.setOpen(false, "swipe", event ?? undefined)) {
                        setDismissed(false);
                        settle();
                    }
                    return;
                }
                if (outcome.snapPoint !== null) {
                    const point = current.points[outcome.snapPoint];
                    if (point !== undefined) {
                        current.setSnapPoint(point.value, {
                            reason: "swipe",
                            event: event ?? undefined,
                        });
                    }
                }
                settle();
            },
        });
    }, [open, popup, swipeDirection, vertical, setSwipe]);

    const nestedDrawerOpen = nestedDialogs > 0;
    const expanded = offset === 0;
    const state: DrawerPopupState = {
        open,
        nested,
        nestedDrawerOpen,
        swiping,
        swipeDirection,
        expanded,
    };
    const resolvedClass =
        typeof className === "function" ? className(state) : className;
    const resolvedStyle = typeof style === "function" ? style(state) : style;
    const sign = swipeDirection === "up" ? -1 : 1;
    const variables = {
        "--drawer-swipe-movement-x": `${movement.x}px`,
        "--drawer-swipe-movement-y": `${movement.y}px`,
        "--drawer-snap-point-offset": `${offset * sign}px`,
        "--drawer-swipe-progress": drawer.swipe.progress,
        ...resolvedStyle,
    } as CSSProperties;
    return (
        <DialogPopup
            {...props}
            className={resolvedClass}
            style={variables}
            render={
                typeof render === "function"
                    ? (merged: Record<string, unknown>) => render(merged, state)
                    : render
            }
            {...stateAttributes({
                "swipe-direction": swipeDirection,
                swiping,
                "swipe-dismiss": dismissed && !open,
                expanded,
            })}
        />
    );
}
