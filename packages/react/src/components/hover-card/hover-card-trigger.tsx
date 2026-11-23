import type { FocusEvent, PointerEvent } from "react";
import {
    type OverlayTriggerProps,
    useOverlayTrigger,
} from "../../hooks/use-overlay-trigger.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { HoverCardContext } from "./hover-card-context.ts";
import type { HoverCardHandle } from "./hover-card-handle.ts";

function isFocusVisible(element: Element): boolean {
    try {
        return element.matches(":focus-visible");
    } catch {
        return true;
    }
}

export interface HoverCardTriggerProps<Payload = unknown>
    extends PartProps<{ open: boolean }>,
        OverlayTriggerProps<HoverCardHandle<Payload>, Payload> {}

/** The link the card previews, and the anchor; with a `handle`, anywhere (spec/hover-card.md). */
export function HoverCardTrigger<Payload = unknown>({
    handle,
    payload,
    id: idProp,
    ...props
}: HoverCardTriggerProps<Payload>) {
    const { root, id, ref, active } = useOverlayTrigger(
        HoverCardContext,
        "HoverCard.Trigger",
        { handle, payload, id: idProp },
    );
    return renderElement(
        "a",
        props,
        { open: active },
        {
            id,
            "data-primitives-part": "hover-card-trigger",
            ...stateAttributes({ "popup-open": active }),
            onPointerEnter: (event: PointerEvent<HTMLElement>) => {
                // a tap follows the link: no card
                if (event.pointerType !== "touch") {
                    root?.intentStart(
                        "trigger-hover",
                        event.currentTarget,
                        event.nativeEvent,
                    );
                }
            },
            onPointerLeave: (event: PointerEvent<HTMLElement>) => {
                if (event.pointerType !== "touch") {
                    root?.hoverEnd(event.currentTarget);
                }
            },
            onFocus: (event: FocusEvent<HTMLElement>) => {
                if (isFocusVisible(event.currentTarget)) {
                    root?.intentStart(
                        "trigger-focus",
                        event.currentTarget,
                        event.nativeEvent,
                    );
                }
            },
            onBlur: (event: FocusEvent<HTMLElement>) => {
                root?.blur(event.currentTarget, event.nativeEvent);
            },
        },
        ref,
    );
}
