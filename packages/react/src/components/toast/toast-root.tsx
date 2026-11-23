import {
    type SwipeDirection,
    swipeMovement,
    swipeRelease,
    watchSwipe,
} from "@fragiola/primitives/swipe";
import {
    measureToastHeight,
    type ToastObject,
} from "@fragiola/primitives/toast";
import {
    type CSSProperties,
    type KeyboardEvent,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { usePresence } from "../../hooks/use-presence.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ToastProviderContext,
    ToastRootContext,
    ToastViewportContext,
} from "./toast-context.ts";

export interface ToastRootState {
    type: string | undefined;
    expanded: boolean;
    limited: boolean;
    swiping: boolean;
    swipeDirection: SwipeDirection | undefined;
}

export interface ToastRootProps<Data = unknown>
    extends PartProps<ToastRootState> {
    /** The toast of the queue it renders. */
    toast: ToastObject<Data>;
    /** The edge a swipe dismisses it towards (default `right`). */
    swipeDirection?: SwipeDirection;
}

interface Swipe {
    swiping: boolean;
    direction: SwipeDirection | undefined;
    x: number;
    y: number;
}

const AT_REST: Swipe = { swiping: false, direction: undefined, x: 0, y: 0 };

/** One toast (spec/toast.md): its presence, its measure, its swipe and Escape. */
export function ToastRoot<Data = unknown>({
    toast,
    swipeDirection = "right",
    ...props
}: ToastRootProps<Data>) {
    const { manager } = useRequiredContext(ToastProviderContext, "Toast.Root");
    const viewport = useContext(ToastViewportContext);
    const [element, setElement] = useState<HTMLElement | null>(null);
    const elementRef = useRef<HTMLElement | null>(null);
    elementRef.current = element;
    const [titleId, setTitleId] = useState<string | undefined>();
    const [descriptionId, setDescriptionId] = useState<string | undefined>();
    const [swipe, setSwipe] = useState<Swipe>(AT_REST);
    const { id } = toast;

    const presence = usePresence(!toast.closing, () => elementRef.current, {
        onComplete: (open) => {
            if (!open) {
                manager.remove(id);
            }
        },
    });

    // its natural height, on mount and on every update (spec/toast.md, "Stacking")
    // biome-ignore lint/correctness/useExhaustiveDependencies: an update measures again
    useLayoutEffect(() => {
        if (element !== null && !toast.closing) {
            manager.setHeight(id, measureToastHeight(element));
        }
    }, [element, manager, id, toast.updateKey, toast.closing]);

    const focusAfterClose = viewport?.focusAfterClose;
    const close = useCallback(() => {
        const root = elementRef.current;
        if (root !== null) {
            focusAfterClose?.(root);
        }
        manager.close(id);
    }, [focusAfterClose, manager, id]);

    const latest = useRef({ close, swipeDirection });
    latest.current = { close, swipeDirection };
    useEffect(() => {
        if (element === null || toast.closing) {
            return undefined;
        }
        const direction = swipeDirection;
        let ended = false;
        const stopSwipe = watchSwipe(element, {
            directions: [direction],
            onStart: () => {
                manager.pause("swipe");
                setSwipe({ ...AT_REST, swiping: true, direction });
            },
            onMove: (move) => {
                const moved = swipeMovement(direction, move);
                setSwipe({ swiping: true, direction, ...moved });
            },
            onEnd: (end) => {
                manager.resume("swipe");
                const size =
                    direction === "left" || direction === "right"
                        ? element.offsetWidth
                        : element.offsetHeight;
                if (
                    end !== null &&
                    swipeRelease(direction, end, size).dismiss
                ) {
                    ended = true;
                    setSwipe((current) => ({ ...current, swiping: false }));
                    latest.current.close();
                    return;
                }
                setSwipe(AT_REST);
            },
        });
        return () => {
            stopSwipe();
            if (!ended) {
                manager.resume("swipe");
            }
        };
    }, [element, toast.closing, swipeDirection, manager]);

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape" && !event.defaultPrevented) {
            event.preventDefault();
            close();
        }
    };

    const value = useMemo(
        () => ({
            toast: toast as ToastObject<unknown>,
            titleId,
            setTitleId,
            descriptionId,
            setDescriptionId,
            close,
        }),
        [toast, titleId, descriptionId, close],
    );
    const expanded = viewport?.expanded ?? false;
    const state: ToastRootState = {
        type: toast.type,
        expanded,
        limited: toast.limited,
        swiping: swipe.swiping,
        swipeDirection: swipe.direction,
    };
    const status = presence.status;
    return (
        <ToastRootContext.Provider value={value}>
            {renderElement(
                "div",
                props,
                state,
                {
                    role: toast.priority === "high" ? "alertdialog" : "dialog",
                    "aria-modal": "false",
                    "aria-labelledby": titleId,
                    "aria-describedby": descriptionId,
                    tabIndex: 0,
                    inert: toast.limited ? true : undefined,
                    "data-primitives-part": "toast-root",
                    ...stateAttributes({
                        type: toast.type,
                        expanded,
                        limited: toast.limited,
                        swiping: swipe.swiping,
                        "swipe-direction": swipe.direction,
                        "starting-style": status === "starting",
                        "ending-style": status === "ending",
                    }),
                    style: {
                        "--toast-index": toast.index,
                        "--toast-offset-y": `${toast.offsetY}px`,
                        "--toast-height":
                            toast.height > 0 ? `${toast.height}px` : undefined,
                        "--toast-swipe-movement-x": `${swipe.x}px`,
                        "--toast-swipe-movement-y": `${swipe.y}px`,
                    } as CSSProperties,
                    onKeyDown,
                },
                setElement,
            )}
        </ToastRootContext.Provider>
    );
}
