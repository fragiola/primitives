import {
    createDelayGroup,
    createHoverIntent,
} from "@fragiola/primitives/hover";
import { interceptEscape } from "@fragiola/primitives/layers";
import { trackHoverBridge } from "@fragiola/primitives/pointer";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    type ReactNode,
    useCallback,
    useContext,
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
import { TooltipContext, TooltipProviderContext } from "./tooltip-context.ts";
import type { TooltipHandle } from "./tooltip-handle.ts";

export interface TooltipRootProps<Payload = unknown>
    extends OverlayRootProps,
        OverlayTriggerRootProps {
    /** ms before a hovered trigger opens (default: the Provider's, else 600). */
    delay?: number;
    /** ms before it closes once the pointer left (default: the Provider's, else 0). */
    closeDelay?: number;
    disabled?: boolean;
    /** Connects Triggers rendered outside the Root (spec/tooltip.md, "Detached triggers"). */
    handle?: TooltipHandle<Payload>;
    /** The content, or a function of the active trigger's payload. */
    children?:
        | ReactNode
        | ((state: { payload: Payload | undefined }) => ReactNode);
}

/** Holds the tooltip's state and its hover intent; renders no element (spec/tooltip.md). */
export function TooltipRoot<Payload = unknown>({
    delay: delayProp,
    closeDelay: closeDelayProp,
    disabled = false,
    handle,
    children,
    ...overlayProps
}: TooltipRootProps<Payload>) {
    const root = useOverlayRoot(overlayProps);
    const provider = useContext(TooltipProviderContext);
    // a Root outside any Provider is alone in its own group
    const ownGroup = useMemo(() => createDelayGroup({ timeout: 0 }), []);
    const group = provider?.group ?? ownGroup;
    const delay = delayProp ?? provider?.delay ?? 600;
    const closeDelay = closeDelayProp ?? provider?.closeDelay ?? 0;
    const [instant, setInstant] = useState(false);
    const [arrow, setArrow] = useState<HTMLElement | null>(null);
    const [placed, setPlaced] = useState<{ side: Side; align: Align }>({
        side: "top",
        align: "center",
    });
    const { open, setOpen, trigger, popup } = root;
    const blocked = useRef(false);
    const openedByHover = useRef(false);
    // the trigger the pointer is over, and the one a pending hover delay opens from
    const hovered = useRef<HTMLElement | null>(null);
    const pendingTrigger = useRef<HTMLElement | null>(null);
    const pendingEvent = useRef<Event | undefined>(undefined);

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
                        "trigger-hover",
                        false,
                        pendingEvent.current,
                        pendingTrigger.current,
                    ),
                close: () => hide("trigger-hover"),
            }),
        [show, hide],
    );
    useEffect(() => intent.cancel, [intent]);

    const hoverStart = useCallback(
        (from: HTMLElement, event: Event) => {
            hovered.current = from;
            if (disabled || blocked.current) {
                return;
            }
            if (open) {
                intent.cancel();
                // another trigger of the open tooltip: it moves there at once (spec/tooltip.md)
                if (from !== trigger) {
                    show("trigger-hover", true, event, from);
                }
            } else if (group.isInstant()) {
                intent.cancel();
                show("trigger-hover", true, event, from);
            } else {
                pendingTrigger.current = from;
                pendingEvent.current = event;
                intent.enter(delay);
            }
        },
        [disabled, open, trigger, group, intent, show, delay],
    );
    const hoverEnd = useCallback(
        (from: HTMLElement) => {
            if (hovered.current === from) {
                hovered.current = null;
            }
            blocked.current = false;
            if (!open) {
                intent.cancel();
            }
        },
        [open, intent],
    );
    const press = useCallback(
        (event: Event) => {
            blocked.current = true;
            intent.cancel();
            if (open) {
                hide("trigger-press", event);
            }
        },
        [open, intent, hide],
    );

    // one open tooltip per group: the previous one closes when this one opens
    const closeForGroup = useRef(() => hide("trigger-hover"));
    closeForGroup.current = () => hide("trigger-hover");
    const groupMember = useRef(() => closeForGroup.current());
    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const member = groupMember.current;
        group.opened(member);
        return () => group.closed(member);
    }, [open, group]);

    // a hover-opened tooltip closes once the pointer leaves the trigger, the popup and the gap
    useEffect(() => {
        if (!open || !openedByHover.current || trigger === null) {
            return undefined;
        }
        return trackHoverBridge(trigger, popup, {
            inside: () => intent.cancel(),
            outside: () => {
                // over another of its triggers: the tooltip is moving there
                if (hovered.current !== null && hovered.current !== trigger) {
                    intent.cancel();
                    return;
                }
                intent.leave(closeDelay);
            },
        });
    }, [open, trigger, popup, intent, closeDelay]);

    // Escape closes it and stops there: an enclosing layer stays open
    useEffect(() => {
        if (!open || trigger === null) {
            return undefined;
        }
        return interceptEscape(trigger.ownerDocument, (event) => {
            intent.cancel();
            hide("escape-key", event);
        });
    }, [open, trigger, intent, hide]);

    const value = useMemo(
        () => ({
            ...root,
            show,
            hide,
            hoverStart,
            hoverEnd,
            press,
            instant,
            disabled,
            arrow,
            setArrow,
            placed,
            setPlaced,
        }),
        [
            root,
            show,
            hide,
            hoverStart,
            hoverEnd,
            press,
            instant,
            disabled,
            arrow,
            placed,
        ],
    );
    useAttachHandle(handle, value);
    return (
        <TooltipContext.Provider value={value}>
            {typeof children === "function"
                ? children({ payload: root.payload as Payload | undefined })
                : children}
        </TooltipContext.Provider>
    );
}
