import { createHoverIntent } from "@fragiola/primitives/hover";
import { trackHoverBridge } from "@fragiola/primitives/pointer";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    type OverlayRootProps,
    type OverlayTriggerRootProps,
    useOverlayRoot,
} from "../../hooks/use-overlay-root.ts";
import { useAttachHandle } from "../../hooks/use-overlay-trigger.ts";
import type { ChangeReason } from "../../utils/change-details.ts";
import { HoverCardContext } from "./hover-card-context.ts";
import type { HoverCardHandle } from "./hover-card-handle.ts";

export interface HoverCardRootProps<Payload = unknown>
    extends OverlayRootProps,
        OverlayTriggerRootProps {
    /** ms before a hovered or keyboard-focused trigger opens it (default 600). */
    delay?: number;
    /** ms before it closes once the pointer left the trigger and the card (default 300). */
    closeDelay?: number;
    /** Connects Triggers rendered outside the Root (spec/hover-card.md, "Detached triggers"). */
    handle?: HoverCardHandle<Payload>;
    /** The content, or a function of the active trigger's payload. */
    children?:
        | ReactNode
        | ((state: { payload: Payload | undefined }) => ReactNode);
}

/** Holds the card's state and its hover intent; renders no element (spec/hover-card.md). */
export function HoverCardRoot<Payload = unknown>({
    delay = 600,
    closeDelay = 300,
    handle,
    children,
    ...overlayProps
}: HoverCardRootProps<Payload>) {
    const root = useOverlayRoot(overlayProps);
    const [instant, setInstant] = useState(false);
    const [arrow, setArrow] = useState<HTMLElement | null>(null);
    const [placed, setPlaced] = useState<{ side: Side; align: Align }>({
        side: "bottom",
        align: "center",
    });
    const { open, setOpen, trigger, popup, positioner } = root;
    const openedByHover = useRef(false);
    // the trigger the pointer is over, and what a pending delay opens from
    const hovered = useRef<HTMLElement | null>(null);
    const pending = useRef<{
        reason: ChangeReason;
        trigger: HTMLElement | null;
        event: Event | undefined;
    }>({ reason: "trigger-hover", trigger: null, event: undefined });
    const triggers = useRef(root.triggers);
    triggers.current = root.triggers;

    const show = useCallback(
        (
            reason: ChangeReason,
            isInstant: boolean,
            event?: Event,
            from?: HTMLElement | null,
        ) => {
            if (setOpen(true, reason, event, from)) {
                openedByHover.current = reason === "trigger-hover";
                setInstant(isInstant);
            }
        },
        [setOpen],
    );
    const hide = useCallback(
        (reason: ChangeReason, event?: Event) => {
            setOpen(false, reason, event);
        },
        [setOpen],
    );
    const intent = useMemo(
        () =>
            createHoverIntent({
                open: () =>
                    show(
                        pending.current.reason,
                        false,
                        pending.current.event,
                        pending.current.trigger,
                    ),
                close: () => hide("trigger-hover"),
            }),
        [show, hide],
    );
    useEffect(() => intent.cancel, [intent]);

    const intentStart = useCallback(
        (
            reason: "trigger-hover" | "trigger-focus",
            from: HTMLElement,
            event: Event,
        ) => {
            if (reason === "trigger-hover") {
                hovered.current = from;
            }
            if (open) {
                intent.cancel();
                // another trigger of the open card: it moves there at once
                if (from !== trigger) {
                    show(reason, true, event, from);
                }
                return;
            }
            pending.current = { reason, trigger: from, event };
            intent.enter(delay);
        },
        [open, trigger, intent, show, delay],
    );
    const hoverEnd = useCallback(
        (from: HTMLElement) => {
            if (hovered.current === from) {
                hovered.current = null;
            }
            if (!open) {
                intent.cancel();
            }
        },
        [open, intent],
    );
    const blur = useCallback(
        (from: HTMLElement, event: FocusEvent) => {
            const next = event.relatedTarget;
            if (!open) {
                if (pending.current.reason === "trigger-focus") {
                    intent.cancel();
                }
                return;
            }
            if (from !== trigger) {
                return;
            }
            // focus moving into the card keeps it open
            if (
                next instanceof Node &&
                (popup?.contains(next) || positioner?.contains(next))
            ) {
                return;
            }
            intent.cancel();
            hide("trigger-focus", event);
        },
        [open, trigger, popup, positioner, intent, hide],
    );

    // a hover-opened card closes once the pointer leaves the trigger, the card and the safe area
    useEffect(() => {
        if (!open || !openedByHover.current || trigger === null) {
            return undefined;
        }
        return trackHoverBridge(trigger, popup, {
            inside: () => intent.cancel(),
            outside: () => {
                // over another of its triggers: the card is moving there
                const other = hovered.current;
                if (
                    other !== null &&
                    other !== trigger &&
                    other.isConnected &&
                    triggers.current.includes(other)
                ) {
                    intent.cancel();
                    return;
                }
                intent.leave(closeDelay);
            },
        });
    }, [open, trigger, popup, intent, closeDelay]);

    useEffect(() => {
        if (!open) {
            intent.cancel();
        }
    }, [open, intent]);

    const value = useMemo(
        () => ({
            ...root,
            show,
            hide,
            intentStart,
            hoverEnd,
            blur,
            instant,
            arrow,
            setArrow,
            placed,
            setPlaced,
        }),
        [root, show, hide, intentStart, hoverEnd, blur, instant, arrow, placed],
    );
    useAttachHandle(handle, value);
    return (
        <HoverCardContext.Provider value={value}>
            {typeof children === "function"
                ? children({ payload: root.payload as Payload | undefined })
                : children}
        </HoverCardContext.Provider>
    );
}
